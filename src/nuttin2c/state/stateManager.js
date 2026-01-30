import { Method } from "coreutil_v1";

/**
 * StateManager
 * 
 * @template T, T2
 */
export class StateManager {

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
     * @param {Method} domainListener
     * @param {Method} errorListener
     */
    react(domainListener, errorListener = null) {
        const anyKey = "__ANY__";
        if (!this.domainListeners.has(anyKey)) {
            this.domainListeners.set(anyKey, new Array());
        }
        this.domainListeners.get(anyKey).push(domainListener);

        if (errorListener != null) {
            if (!this.errorListeners.has(anyKey)) {
                this.errorListeners.set(anyKey, new Array());
            }
            this.errorListeners.get(anyKey).push(errorListener);
        }
    }

    /**
     * 
     * @param {string} key 
     * @param {Method} listener 
     */
    reactTo(key, domainListener, errorListener = null) {
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

    /**
     * @param {Promise<T>} object
     */
    async handle(objectPromise, key = "__DEFAULT__") {
        try {
            const object = await objectPromise;
            return await this.updateDomain(object, key);
        } catch (error) {
            await this.updateError(error, key);
            return error;
        }
    }

    async updateError(error, key = "__DEFAULT__") {
        this.initialized = true;
        this.errorMap.set(key, error);
        this.signalErrorChange(error, key);
    }

    /**
     * Update the state
     * 
     * @param {any} object 
     * @param {string} key 
     * @param {T} object 
     */
    async updateDomain(object, key = "__DEFAULT__") {
        if (Array.isArray(object)) {
            for (let i = 0; i < object.length; i++) {
                object[i] = this.createProxy(object[i], key, this);
            }
        }
        object = this.createProxy(object, key, this);
        this.domainMap.set(key, object);
        this.initialized = true;
        if (this.errorMap.get(key) != null) {
            this.errorMap.delete(key);
            this.signalErrorChange(null, key);
        }
        this.signalDomainChange(object, key);
        return object;
    }

    async delete(key = "__DEFAULT__") {
        this.domainMap.delete(key);
        this.domainListeners.delete(key);
        this.errorMap.delete(key);
        this.errorListeners.delete(key);
        this.initialized = true;
        this.signalDomainChange(null, key);
    }

    async clear() {
        this.initialized = true;
        for (let key of this.domainMap.keys()) {
            this.signalDomainChange(null, key);
        }
        this.signalDomainChange(null, "__ANY__");
        this.domainMap.clear();
        this.domainListeners.clear();
        this.errorMap.clear();
        this.errorListeners.clear();
        this.initialized = false;
    }

    signalDomainChange(object, key) {
        if (this.domainListeners.has(key)) {
            for (let listener of this.domainListeners.get(key)) {
                listener.call([object, key]);
            }
        }

        const anyKey = "__ANY__";
        if (key != anyKey && this.domainListeners.has(anyKey)) {
            for (let listener of this.domainListeners.get(anyKey)) {
                listener.call([object, key]);
            }
        }
    }

    signalErrorChange(error, key) {
        if (this.errorListeners.has(key)) {
            for (let listener of this.errorListeners.get(key)) {
                listener.call([error, key]);
            }
        }

        const anyKey = "__ANY__";
        if (key != anyKey && this.errorListeners.has(anyKey)) {
            for (let listener of this.errorListeners.get(anyKey)) {
                listener.call([error, key]);
            }
        }
    }

    createProxy(object, key, stateManager) {
        return new Proxy(object, {
            set: (target, prop, value) => {
                if (target[prop] === value) {
                    return true;
                }
                const success = (target[prop] = value);
                stateManager.signalDomainChange(target, key);
                return success === value;
            }
        });
    }

}