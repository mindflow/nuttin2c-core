export class NamedTrailRegistry {

    constructor(registry) {
        /** @type {Object} */
        this.registry = registry;
    }

    /**
     * 
     * @param {String} name 
     * @returns 
     */
    async getTrail(name) {
        if (this.registry[name]) {
            return this.registry[name];
        }
        return null;
    }

}