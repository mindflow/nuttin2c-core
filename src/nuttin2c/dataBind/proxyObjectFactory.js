export class ProxyObjectFactory {

    static CHANGE_LISTENER_PROXY = Symbol('changeListenerProxy');

    /**
     * Creates a proxy for an object which allows databinding from the object to the form element
     * 
     * @template T
     * @param {T} object 
     * @returns {T}
     */
    static createProxyObject(object) {
        if (object[ProxyObjectFactory.CHANGE_LISTENER_PROXY]) {
            LOG.warn("Object is already a change listener proxy.");
            return object;
        }
        return new Proxy(object, {
            get: (target, prop, receiver) => {
                if (prop === ProxyObjectFactory.CHANGE_LISTENER_PROXY) {
                    return true;
                }
                return Reflect.get(target, prop, receiver);
            },
            set: (target, prop, value) => {
                let success = (target[prop] = value);

                let changedFunctionName = "__changed_" + prop;
                let changedFunction = target[changedFunctionName];
                if(changedFunction && typeof changedFunction === "function") {
                    let boundChangedFunction = changedFunction.bind(target);
                    boundChangedFunction();
                }
                return success === value;
            }
        });
    }
}