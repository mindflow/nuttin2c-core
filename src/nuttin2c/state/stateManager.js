import { Method } from "coreutil_v1";
import { StateChange } from "./stateChange";

/**
 * StateManager
 * 
 * @template T, T2
 */
export class StateManager {

    static CHANGE_NEW = "__CHANGE_NEW__";
    static CHANGE_UPDATE = "__CHANGE_UPDATE__";
    static CHANGE_DELETE = "__CHANGE_DELETE__";

    static KEY_ANY = "__KEY_ANY__";
    static KEY_DEFAULT = "__KEY_DEFAULT__";

    static TRIGGER_CREATE = "__TRIGGER_CREATE__";
    static TRIGGER_DELETE = "__TRIGGER_DELETE__";
    static TRIGGER_UPDATE = "__TRIGGER_UPDATE__";
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
        const domainListener = new Method(domainListenerFunction, context, key != StateManager.KEY_ANY);
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

    async updateDomainByArray(array, property) {
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

    async updateDomainByMap(map) {
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

    async updateDomain(object, key = StateManager.KEY_DEFAULT) {
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
        this.signalDomainChange([new StateChange(proxyObject, key, change)]);
        return proxyObject;
    }

    async delete(key = StateManager.KEY_DEFAULT) {

        this.domainMap.delete(key);
        this.errorMap.delete(key);

        this.initialized = true;

        if (this.domainMap.has(key)) {
            this.signalDomainChange([new StateChange(this.domainMap.get(key), key, StateManager.CHANGE_DELETE)]);
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
            stateChangeArray.push(new StateChange(this.domainMap.get(key), key, StateManager.CHANGE_DELETE));
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
            stateChangeArray.push(new StateChange(this.domainMap.get(key), key, StateManager.CHANGE_DELETE));
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
     */
    signalDomainChange(stateChangeArray) {

        // Signal domain changes to all listeners for the specific key
        for (let stateChange of stateChangeArray) {
            const { object, key, change } = stateChange;
            if (key != StateManager.KEY_DEFAULT && !this.domainListeners.has(key)) {
                continue;
            }
            for (let listener of this.domainListeners.get(key)) {
                listener.call([object, key, change]);
            }
        }

        if (!this.domainListeners.has(StateManager.KEY_ANY)) {
            return;
        }

        // Signal domain changes to all listeners for any key, and finish with finalize for the collected changes
        for (let listener of this.domainListeners.get(StateManager.KEY_ANY)) {
            // Pass the every state change to the listener for the ANY key
            listener.call(stateChangeArray);
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

    createProxy(object, key, stateManager) {
        return new Proxy(object, {
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
                stateManager.signalDomainChange(target, key, StateManager.CHANGE_UPDATE);
                return success === value;
            }
        });
    }

}