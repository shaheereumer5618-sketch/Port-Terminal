export class Container {
    constructor(id, weight, dest) {
        this.id = id;
        this.weight = weight;
        this.dest = dest;
        this.status = "inYard";
        this.shipId = null;
        this.lastYardPrevious = null;
        this.lastYardNext = null;
    }
}