export class StateChange {
    constructor(object, key, change) {
        this.object = object;
        this.key = key;
        this.change = change;
    }
}