import { Method, Map, List, Logger } from "coreutil_v1";

const LOG = new Logger("EventManager");

/**
 * EventManager
 */
export class EventManager {


    /**
     * 
     */
    constructor() {
        /** @type Map<List<Method>> */
        this.listenerMap = new Map();
    }

    /**
     * 
     * @param {string} eventType 
     * @param {Function} listenerFunction
     * @param {Object} contextObject
     * @returns {EventManager}
     */
    listenTo(eventType, listenerFunction, contextObject) {
        const listener = new Method(listenerFunction, contextObject);
        if (!this.listenerMap.contains(eventType)) {
            this.listenerMap.set(eventType, new List());
        }
        this.listenerMap.get(eventType).add(listener);
        return this;
    }

    /**
     * 
     * @param {string} sourceEventType 
     * @param {EventManager} destinationEventManager 
     * @param {string} destinationEventType 
     * @param {Boolean} logging
     * @returns {EventManager}
     */
    route(sourceEventType, destinationEventManager, destinationEventType, logging = false) {
        this.listenTo(sourceEventType, (parameter) => {
            if (logging) {
                LOG.info(`Routing event ${sourceEventType} to ${destinationEventType}`);
            }
            destinationEventManager.trigger(destinationEventType, parameter);
        }, this);
        return this;
    }

    /**
     * 
     * @param {string} eventType 
     * @param {Array|any} parameter 
     * @returns {Promise<Array>}
     */
    async trigger(eventType, parameter) {
        if (!eventType) {
            LOG.error("Event type is undefined");
            return;
        }
        if (!this.listenerMap.contains(eventType)) {
            return;
        }
        let resultArray = [];
        this.listenerMap.get(eventType).forEach((listener, parent) => {
            resultArray.push(listener.call(parameter));
            return true;
        });
        if (resultArray.length === 1) {
            return resultArray[0];
        }
        return Promise.all(resultArray);
    }

}