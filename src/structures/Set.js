
import { HashMap } from "./HashMap.js";

export class Set {
    constructor() {
        this.map = new HashMap();
    }

    add(item) {
        this.map.set(item, true);
    }

    has(item) {
        return this.map.has(item);
    }

    delete(item) {
        return this.map.delete(item);
    }

    size() {
        return this.map.size();
    }

    values() {
        return this.map.keys();
    }
}
