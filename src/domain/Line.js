import { PriorityQueue } from "../structures/PriorityQueue.js";

export class Line {
    constructor(id, capacity = 8) {
        this.id = id;
        this.capacity = capacity;
        this.ships = new PriorityQueue();
        this.currentShipId = null;
    }

    enqueue(ship, seq) {
        if (this.isFull()) {
            return false;
        }

        this.ships.push(ship.priority, seq, ship.id);
        ship.currentLineId = this.id;
        ship.status = "waiting";

        return true;
    }

    dequeueNext() {
        const entry = this.ships.pop();

        return entry === null ? null : entry.value;
    }

    size() {
        const activeCount = this.currentShipId === null ? 0 : 1;

        return activeCount + this.ships.size();
    }

    isFull() {
        return this.size() >= this.capacity;
    }

    isEmpty() {
        return this.size() === 0;
    }

    peek() {
        const entry = this.ships.peek();

        return entry === null ? null : entry.value;
    }

    removeCurrentShip() {
        const shipId = this.currentShipId;
        this.currentShipId = null;

        return shipId;
    }

    advance() {
        if (this.currentShipId !== null) {
            return null;
        }

        const nextShipId = this.dequeueNext();

        if (nextShipId === null) {
            return null;
        }

        this.currentShipId = nextShipId;

        return nextShipId;
    }

    snapshot(port) {
        const shipIds = [];

        if (this.currentShipId !== null) {
            shipIds.push(this.currentShipId);
        }

        const waitingShips = this.ships.items.slice().sort(
            (a, b) => a.priority - b.priority || a.seq - b.seq
        );

        for (const entry of waitingShips) {
            shipIds.push(entry.value);
        }

        const priorityLabels = {
            "-1": "Emergency",
            0: "Critical",
            1: "High",
            2: "Normal",
            3: "Low",
            4: "Very low",
            5: "Bulk"
        };

        const ships = shipIds.map(id => {
            const ship = port.ships.get(id);

            if (!ship) {
                return null;
            }

            return {
                id: ship.id,
                name: ship.name,
                priority: ship.priority,
                priorityLabel: priorityLabels[ship.priority],
                state: ship.status,
                capacity: ship.capacity,
                used: ship.containerCount(),
                containers: ship.listContainers(),
                activeContainerId: ship.activeContainerId,
                progress: ship.progress
            };
        }).filter(ship => ship !== null);

        return {
            id: this.id,
            ships
        };
    }
}