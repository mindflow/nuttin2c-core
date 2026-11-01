import { Method } from "coreutil_v1";
import { StateChange } from "./stateChange";

/**
 * StateManager
 * 
 * @template T, T2
 */
export class StateManager {

    static STATE_MANAGER_PROXY = Symbol('stateManagerProxy');

    /** A change was observed creating adding new domain object */
    static CHANGE_NEW = "__CHANGE_NEW__";

    /** A change was observed updating an existing domain object */
    static CHANGE_UPDATE = "__CHANGE_UPDATE__";

    /** A change was observed removing an existing domain object */
    static CHANGE_REMOVE = "__CHANGE_REMOVE__";


    /** This key matches any key in the domain map */
    static KEY_ANY = "__KEY_ANY__";

    /** The default key used when no specific key is provided */
    static KEY_DEFAULT = "__KEY_DEFAULT__";


    /** A trigger to create an object or objects downstream, resulted in a domain change */
    static TRIGGER_CREATE = "__TRIGGER_CREATE__";

    /** A trigger to delete an object or objects downstream, resulted in a domain change */
    static TRIGGER_DELETE = "__TRIGGER_DELETE__";

    /** A trigger to update an object or objects downstream, resulted in a domain change */
    static TRIGGER_UPDATE = "__TRIGGER_UPDATE__";

    /** A trigger to read an object or objects downstream, resulted in a domain change */
    static TRIGGER_READ = "__TRIGGER_READ__";

    constructor() {
        /** @type {Map<String, T>} */
        this.domainMap = new Map();

        /** @type {Map<String, T2>} */
        this.errorMap = new Map();

        /** @type {Map<String, Array<Method>} */
        this.domainListeners = new Map();

        /** @type {Map<String, Array<Method>} */
        this.errorListeners = new Map();

        /** @type {boolean} */
        this.initialized = false;
    }

    /**
     * @param {any} context
     * @param {Function} domainListener
     * @param {Function} errorListener
     * @param {String} key
     */
    react(context, domainListenerFunction, errorListenerFunction = null, key = StateManager.KEY_DEFAULT) {

        // If key is ANY, then we are passing an array, so the listener should expect an array of state changes rather than individual objects.
        const domainListener = new Method(domainListenerFunction, context);
        const errorListener = errorListenerFunction ? new Method(errorListenerFunction, context, key != StateManager.KEY_ANY) : null;

        if (!this.domainListeners.has(key)) {
            this.domainListeners.set(key, new Array());
        }
        this.domainListeners.get(key).push(domainListener);

        if (errorListener != null) {
            if (!this.errorListeners.has(key)) {
                this.errorListeners.set(key, new Array());
            }
            this.errorListeners.get(key).push(errorListener);
        }
    }

    get objectArray() {
        return Array.from(this.domainMap.values());
    }

    async updateError(error, key = StateManager.KEY_DEFAULT) {
        this.initialized = true;
        this.errorMap.set(key, error);
        this.signalErrorChange(error, key);
    }

    async updateDomainByArray(array, property, trigger = StateManager.TRIGGER_READ) {
        if (!Array.isArray(array)) {
            throw new Error("updateDomainArray expects an array");
        }

        const stateChangeArray = new Array();

        // Create proxies for each object in the array and collect their property values as update keys
        for (let i = 0; i < array.length; i++) {
            const object = array[i];
            const propertyValue = object[property];
            const proxyObject = this.createProxy(object, propertyValue, this);
            stateChangeArray.push(new StateChange(proxyObject, propertyValue, this.domainMap.has(propertyValue) ? StateManager.CHANGE_UPDATE : StateManager.CHANGE_NEW));
        }

        this.initialized = true;

        // Update the domain map with the new proxies
        for (const stateChange of stateChangeArray) {
            const { object, key, change } = stateChange;
            this.domainMap.set(key, object);
        }

        // Signal domain change for each updated key
        this.signalDomainChange(stateChangeArray);
    }

    async updateDomainByMap(map, trigger = StateManager.TRIGGER_READ) {
        if (!(map instanceof Map)) {
            throw new Error("updateDomainByMap expects a Map");
        }

        const stateChangeArray = new Array();
        
        // Create proxies for each value in the map and collect their keys as update keys
        for (const [key, value] of map.entries()) {
            const proxyValue = this.createProxy(value, key, this);
            stateChangeArray.push(new StateChange(proxyValue, key, this.domainMap.has(key) ? StateManager.CHANGE_UPDATE : StateManager.CHANGE_NEW));
        }

        this.initialized = true;

        // Update the domain map with the new proxies and record their change types
        for (const stateChange of stateChangeArray) {
            const { object, key, change } = stateChange;
            this.domainMap.set(key, object);
        }

        // Signal domain change for each updated key
        this.signalDomainChange(stateChangeArray);
    }

    /**
     * 
     * @param {any} object the domain object to update
     * @param {string} trigger the trigger type that caused the update
     * @param {string} key the key associated with the domain object
     * @returns {any} the proxied domain object after the update
     */
    async updateDomain(object, key = StateManager.KEY_DEFAULT, trigger = StateManager.TRIGGER_READ) {
        if (Array.isArray(object) || object instanceof Map ) {
            throw new Error("updateDomain expects a single object, not an array or map");
        }

        const proxyObject = this.createProxy(object, key, this);

        let change = this.domainMap.has(key) ? StateManager.CHANGE_UPDATE : StateManager.CHANGE_NEW;

        this.domainMap.set(key, proxyObject);
        
        this.initialized = true;
        if (this.errorMap.get(key) != null) {
            this.errorMap.delete(key);
            this.signalErrorChange(null, key);
        }
        this.signalDomainChange([new StateChange(proxyObject, key, change)], trigger);
        return proxyObject;
    }

    /**
     * 
     * @param {string} trigger the trigger type that caused the deletion
     * @param {string} key the key associated with the domain object to delete
     */
    async remove(key = StateManager.KEY_DEFAULT, trigger = StateManager.TRIGGER_DELETE) {

        this.domainMap.delete(key);
        this.errorMap.delete(key);

        this.initialized = true;

        if (this.domainMap.has(key)) {
            this.signalDomainChange([new StateChange(this.domainMap.get(key), key, StateManager.CHANGE_REMOVE)], trigger);
        }

        if (StateManager.KEY_DEFAULT !== key) {
            this.domainListeners.delete(key);
            this.errorListeners.delete(key);
        }
    }

    async reset() {
        this.initialized = true;
        const stateChangeArray = [];
        for (let key of this.domainMap.keys()) {
            stateChangeArray.push(new StateChange(this.domainMap.get(key), key, StateManager.CHANGE_REMOVE), StateManager.TRIGGER_READ);
        }
        this.signalDomainChange(stateChangeArray);

        this.domainMap.clear();
        this.errorMap.clear();

        this.initialized = false;

        this.errorListeners.clear();
        this.domainListeners.clear();
    }

    async clear() {
        this.initialized = true;
        const stateChangeArray = [];
        for (let key of this.domainMap.keys()) {
            stateChangeArray.push(new StateChange(this.domainMap.get(key), key, StateManager.CHANGE_REMOVE), StateManager.TRIGGER_READ);
        }
        this.signalDomainChange(stateChangeArray);

        this.domainMap.clear();
        const anyKeyDomainListener = this.domainListeners.get(StateManager.KEY_ANY);
        this.domainListeners.clear();
        this.domainListeners.set(StateManager.KEY_ANY, anyKeyDomainListener);

        this.errorMap.clear();
        const anyKeyErrorListeners = this.errorListeners.get(StateManager.KEY_ANY);
        this.errorListeners.clear();
        this.errorListeners.set(StateManager.KEY_ANY, anyKeyErrorListeners);

        this.initialized = false;
    }

    /**
     * Signals a domain change to all listeners for a specific key.
     * @param {StateChange[]} stateChangeArray - An array of StateChange objects representing the changes.
     * @param {string} trigger - The trigger that caused the domain change.
     */
    signalDomainChange(stateChangeArray, trigger = StateManager.TRIGGER_READ) {

        // Signal domain changes to all listeners for the specific key
        for (const stateChange of stateChangeArray) {
            const { object, key, change } = stateChange;
            if (key != StateManager.KEY_DEFAULT && !this.domainListeners.has(key)) {
                continue;
            }
            for (let listener of this.domainListeners.get(key)) {
                listener.call([object, key, change, trigger]);
            }
        }

        if (!this.domainListeners.has(StateManager.KEY_ANY)) {
            return;
        }

        // Signal domain changes to all listeners for any key, and finish with finalize for the collected changes
        for (let listener of this.domainListeners.get(StateManager.KEY_ANY)) {
            // Pass the every state change to the listener for the ANY key
            listener.call([stateChangeArray, trigger]);
        }
    }

    /**
     * Signals an error change to all listeners for a specific key.
     * @param {any} error - The error that has occurred.
     * @param {string} key - The key associated with the error.
     */
    signalErrorChange(error, key) {
        if (this.errorListeners.has(key)) {
            for (let listener of this.errorListeners.get(key)) {
                listener.call([error, key]);
            }
        }

        if (key != StateManager.KEY_ANY && this.errorListeners.has(StateManager.KEY_ANY)) {
            for (let listener of this.errorListeners.get(StateManager.KEY_ANY)) {
                listener.call([error, key]);
            }
        }
    }

    /**
     * 
     * @param {any} object 
     * @param {string} key 
     * @param {StateManager} stateManager 
     * @returns 
     */
    createProxy(object, key, stateManager) {
        if (object[StateManager.STATE_MANAGER_PROXY]) {
            LOG.warn("Object is already a state manager proxy.");
            return object;
        }
        return new Proxy(object, {
            get: (target, prop, receiver) => {
                if (prop === StateManager.STATE_MANAGER_PROXY) {
                    return true;
                }
                return Reflect.get(target, prop, receiver);
            },
            /**
             * Signals a domain change when a property is set on the state managed object.
             * @param {any} target 
             * @param {string} prop 
             * @param {any} value 
             * @returns 
             */
            set: (target, prop, value) => {
                if (target[prop] === value) {
                    return true;
                }
                const success = (target[prop] = value);
                const stateChange = new StateChange(target, key, StateManager.CHANGE_UPDATE);
                stateManager.signalDomainChange([stateChange], StateManager.TRIGGER_READ);
                return success === value;
            }
        });
    }

}