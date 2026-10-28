import { Line } from "../domain/Line.js";
import { Ship } from "../domain/Ship.js";
import { Container } from "../domain/Container.js";

import { Stack } from "../structures/Stack.js";
import { Queue } from "../structures/Queue.js";
import { PriorityQueue } from "../structures/PriorityQueue.js";
import { HashMap } from "../structures/HashMap.js";
import { MinHeap } from "../structures/MinHeap.js";
import { BST } from "../structures/BST.js";
import { Graph } from "../structures/Graph.js";
import { Trie } from "../structures/Trie.js";
import { Set } from "../structures/Set.js";

const PRIORITY_LABELS = {
    "-1": "Emergency",
    0: "Critical",
    1: "High",
    2: "Normal",
    3: "Low",
    4: "Very low",
    5: "Bulk"
};

export class Port {
    constructor() {
        this.lines = [
            new Line(1),
            new Line(2),
            new Line(3),
            new Line(4)
        ];

        this.ships = new HashMap();
        this.containers = new HashMap();
        this.containersByShip = new HashMap();

        this.yard = new HashMap();
        this.yardQueue = new Queue();
        this.atSeaQueue = new PriorityQueue();
        this.parkedQueue = new Queue();

        this.unloadStack = new Stack();
        this.dockingHistoryStack = new Stack();

        this.arrivalIndex = new BST();
        this.destGraph = new Graph();
        this.containerTrie = new Trie();
        this.shipTrie = new Trie();
        this.uniqueDestSet = new Set();

        this.seq = 0;
        this.simTime = 0;
    }

    addShip(shipId, name, arrival, priority = 2, capacity = 10) {
        if (!Number.isInteger(priority) || priority < -1 || priority > 5) {
            throw new Error("Priority must be an integer from -1 to 5.");
        }

        if (this.ships.has(shipId)) {
            throw new Error(`Ship "${shipId}" already exists.`);
        }

        const ship = new Ship(
            shipId,
            name,
            arrival,
            priority,
            capacity
        );

        this.ships.set(shipId, ship);
        this.arrivalIndex.insert([arrival, shipId], shipId);
        this.shipTrie.insert(shipId);

        return ship;
    }

    addContainer(containerId, weight, dest) {
        if (this.containers.has(containerId)) {
            throw new Error(`Container "${containerId}" already exists.`);
        }

        const container = new Container(containerId, weight, dest);

        this.containers.set(containerId, container);
        this.containerTrie.insert(containerId);

        this.yard.set(containerId, container);
        this.yardQueue.enqueue(containerId);

        this.uniqueDestSet.add(dest);
        this.destGraph.addNode(dest);

        return container;
    }

    addRoute(from, to) {
        this.destGraph.addEdge(from, to);
        return true;
    }

    shipArrives(shipId, requestedLineId = null) {
        const ship = this.ships.get(shipId);

        if (!ship) {
            throw new Error(`Ship "${shipId}" does not exist.`);
        }

        const alreadyInLine = this.lines.some(line =>
            line.currentShipId === shipId ||
            line.ships.items.some(entry => entry.value === shipId)
        );

        const alreadyAtSea = this.atSeaQueue.items.some(
            entry => entry.value === shipId
        );

        const alreadyParked = this.parkedQueue.toArray().includes(shipId);

        if (
            alreadyInLine ||
            alreadyAtSea ||
            alreadyParked ||
            ship.status === "departed"
        ) {
            throw new Error(`Ship "${shipId}" has already arrived.`);
        }

        const seq = this.seq;
        this.seq++;

        return this.assignToLine(ship, seq, requestedLineId);
    }

    assignToLine(ship, seq, requestedLineId = null) {
        let availableLines;

        if (requestedLineId !== null) {
            const requestedLine = this.lines.find(
                line => line.id === requestedLineId
            );

            if (!requestedLine) {
                throw new Error("Invalid line ID. Choose a line from 1 to 4.");
            }

            availableLines =
                requestedLine.size() < requestedLine.capacity
                    ? [requestedLine]
                    : [];
        } else {
            availableLines = this.lines.filter(
                line => line.size() < line.capacity
            );
        }

        if (availableLines.length === 0) {
            this.atSeaQueue.push(
                ship.priority,
                seq,
                ship.id
            );

            ship.status = "atSea";
            ship.currentLineId = null;

            return {
                shipId: ship.id,
                lineId: null,
                overflown: true,
                dockedShipId: null
            };
        }

        let selectedLine = availableLines[0];

        for (const line of availableLines) {
            if (
                line.size() < selectedLine.size() ||
                (
                    line.size() === selectedLine.size() &&
                    line.id < selectedLine.id
                )
            ) {
                selectedLine = line;
            }
        }

        selectedLine.enqueue(ship, seq);

        let dockedShipId = null;

        if (selectedLine.currentShipId === null) {
            dockedShipId = selectedLine.advance();

            if (dockedShipId !== null) {
                const activeShip = this.ships.get(dockedShipId);
                activeShip.status = "docked";
                activeShip.operationMode =
                    activeShip.containerCount() === 0 ? "load" : "unload";
                activeShip.arrivalTime = this.simTime;
            }
        }

        return {
            shipId: ship.id,
            lineId: selectedLine.id,
            overflown: false,
            dockedShipId
        };
    }

    depart(shipId) {
        const ship = this.ships.get(shipId);

        if (!ship) {
            throw new Error(`Ship "${shipId}" does not exist.`);
        }

        const line = this.lines.find(
            line => line.currentShipId === shipId
        );

        if (!line) {
            throw new Error(
                `Ship "${shipId}" is not the active ship on a line.`
            );
        }

        if (
            ship.status === "loading" ||
            ship.status === "unloading"
        ) {
            throw new Error(
                "A ship cannot depart while loading or unloading."
            );
        }

        // Capture the neighbours at the moment of departure.
        const ordered = [];
        if (line.currentShipId) ordered.push(line.currentShipId);

        const waiting = line.ships.items
            .slice()
            .sort((a, b) => a.priority - b.priority || a.seq - b.seq);

        for (const entry of waiting) ordered.push(entry.value);

        const idx = ordered.indexOf(shipId);

        if (idx > 0) {
            const prevShip = this.ships.get(ordered[idx - 1]);
            if (prevShip) {
                ship.lastPrevious = {
                    id: prevShip.id,
                    name: prevShip.name,
                    priority: prevShip.priority,
                    state: prevShip.status,
                    relation: "Ahead in line when departed"
                };
            }
        }

        if (idx >= 0 && idx < ordered.length - 1) {
            const nextShip = this.ships.get(ordered[idx + 1]);
            if (nextShip) {
                ship.lastNext = {
                    id: nextShip.id,
                    name: nextShip.name,
                    priority: nextShip.priority,
                    state: nextShip.status,
                    relation: "Behind in line when departed"
                };
            }
        }

        line.removeCurrentShip();

        ship.status = "departed";
        ship.departureTime = this.simTime;
        ship.currentLineId = null;
        ship.activeContainerId = null;
        ship.progress = 0;
        ship.operationStartedAt = null;
        ship.operationMode = null;

        const nextShipId = line.advance();

        if (nextShipId !== null) {
            const nextShip = this.ships.get(nextShipId);
            nextShip.status = "docked";
            nextShip.operationMode =
                nextShip.containerCount() === 0 ? "load" : "unload";
            nextShip.arrivalTime = this.simTime;

            this.dockingHistoryStack.push(nextShipId);
        }

        let overflowShipIdAssigned = null;

        if (!this.atSeaQueue.isEmpty()) {
            const entry = this.atSeaQueue.pop();
            const overflowShip = this.ships.get(entry.value);

            if (!overflowShip) {
                throw new Error(
                    `Ship "${entry.value}" in the at-sea queue was not found.`
                );
            }

            this.assignToLine(overflowShip, entry.seq);
            overflowShipIdAssigned = overflowShip.id;
        }

        return {
            shipId,
            lineId: line.id,
            nextShipId,
            overflowShipIdAssigned
        };
    }

    parkShip(shipId) {
        const ship = this.ships.get(shipId);

        if (!ship) {
            throw new Error(`Ship "${shipId}" does not exist.`);
        }

        if (
            ship.status === "loading" ||
            ship.status === "unloading"
        ) {
            throw new Error(
                "A ship cannot be parked while loading or unloading."
            );
        }

        if (!ship.isEmpty()) {
            throw new Error("Only empty ships can be parked.");
        }

        if (ship.status === "parked") {
            throw new Error(`Ship "${shipId}" is already parked.`);
        }

        const line = this.lines.find(
            line => line.currentShipId === shipId
        );

        if (line) {
            line.removeCurrentShip();

            const nextShipId = line.advance();

            if (nextShipId !== null) {
                const nextShip = this.ships.get(nextShipId);
                nextShip.status = "docked";
                nextShip.operationMode =
                    nextShip.containerCount() === 0 ? "load" : "unload";
                nextShip.arrivalTime = this.simTime;

                this.dockingHistoryStack.push(nextShipId);
            }
        }

        ship.status = "parked";
        ship.currentLineId = null;
        ship.activeContainerId = null;
        ship.progress = 0;
        ship.operationStartedAt = null;
        ship.operationMode = null;

        this.parkedQueue.enqueue(shipId);

        return shipId;
    }

    unparkShip(shipId, requestedLineId = null) {
        const ship = this.ships.get(shipId);

        if (!ship) {
            throw new Error(`Ship "${shipId}" does not exist.`);
        }

        if (ship.status !== "parked") {
            throw new Error(`Ship "${shipId}" is not parked.`);
        }

        const parkedIds = this.parkedQueue.toArray();
        let bestId = null;
        let bestPriority = Infinity;

        for (const id of parkedIds) {
            const s = this.ships.get(id);
            if (!s) continue;
            if (s.priority < bestPriority) {
                bestPriority = s.priority;
                bestId = id;
            }
        }

        if (bestId !== shipId) {
            throw new Error(
                "Only the highest-priority parked ship can resume. " +
                "Resume that ship first."
            );
        }

        const remainingIds = parkedIds.filter(id => id !== shipId);
        this.parkedQueue = new Queue();

        for (const id of remainingIds) {
            this.parkedQueue.enqueue(id);
        }

        const seq = this.seq;
        this.seq++;

        return this.assignToLine(ship, seq, requestedLineId);
    }

    _getActiveShip(shipId) {
        const ship = this.ships.get(shipId);

        if (!ship) {
            throw new Error(`Ship "${shipId}" does not exist.`);
        }

        const line = this.lines.find(
            line => line.currentShipId === shipId
        );

        if (!line && ship.status !== "parked") {
            throw new Error(`Ship "${shipId}" is not active on a line.`);
        }

        if (!["docked", "ready", "parked"].includes(ship.status)) {
            throw new Error(
                "Ship is not ready to start another operation."
            );
        }

        return ship;
    }

    startLoading(shipId, containerId) {
        const ship = this._getActiveShip(shipId);
        const container = this.containers.get(containerId);

        if (!container || !this.yard.has(containerId)) {
            throw new Error(`Container "${containerId}" is not in the yard.`);
        }

        if (this.yardQueue.peek() !== containerId) {
            throw new Error("Load containers in FIFO yard order.");
        }

        if (ship.isFull()) {
            throw new Error("Ship has reached its cargo capacity.");
        }

        for (const otherShip of this.ships.values()) {
            if (otherShip.activeContainerId === containerId) {
                throw new Error("Container is already being loaded.");
            }
        }

        ship.status = "loading";
        ship.activeContainerId = containerId;
        ship.progress = 0;
        ship.operationStartedAt = this.simTime;

        return {
            shipId,
            containerId,
            durationMs: 2000
        };
    }

    completeLoading(shipId) {
        const ship = this.ships.get(shipId);

        if (
            !ship ||
            ship.status !== "loading" ||
            ship.activeContainerId === null
        ) {
            throw new Error("Ship has no active loading operation.");
        }

        const containerId = ship.activeContainerId;
        const container = this.containers.get(containerId);

        if (
            !container ||
            !this.yard.has(containerId) ||
            this.yardQueue.peek() !== containerId
        ) {
            throw new Error("Container is no longer available in the yard.");
        }

        if (!ship.load(containerId)) {
            throw new Error("Ship has reached its cargo capacity.");
        }

        // Capture the yard neighbours at the moment the container leaves.
        const yardArray = this.yardQueue.toArray();
        const yardIdx = yardArray.indexOf(containerId);

        if (yardIdx > 0) {
            const prev = this.containers.get(yardArray[yardIdx - 1]);
            if (prev) {
                container.lastYardPrevious = {
                    id: prev.id,
                    weight: prev.weight,
                    dest: prev.dest,
                    relation: "Before in yard when loaded"
                };
            }
        }

        if (yardIdx >= 0 && yardIdx < yardArray.length - 1) {
            const next = this.containers.get(yardArray[yardIdx + 1]);
            if (next) {
                container.lastYardNext = {
                    id: next.id,
                    weight: next.weight,
                    dest: next.dest,
                    relation: "After in yard when loaded"
                };
            }
        }

        this.yardQueue.dequeue();
        this.yard.delete(containerId);

        container.status = "onShip";
        container.shipId = shipId;

        const existing = this.containersByShip.get(shipId) ?? [];
        this.containersByShip.set(
            shipId,
            [...existing, containerId]
        );

        ship.status = "ready";
        ship.activeContainerId = null;
        ship.progress = 0;
        ship.operationStartedAt = null;

        return { shipId, containerId };
    }

    startUnloading(shipId) {
        const ship = this._getActiveShip(shipId);

        if (ship.isEmpty()) {
            throw new Error("Ship has no containers to unload.");
        }

        const containerId = ship.peekTop();

        ship.status = "unloading";
        ship.activeContainerId = containerId;
        ship.progress = 0;
        ship.operationStartedAt = this.simTime;

        return {
            shipId,
            containerId,
            durationMs: 2000
        };
    }

    completeUnloading(shipId) {
        const ship = this.ships.get(shipId);

        if (
            !ship ||
            ship.status !== "unloading" ||
            ship.activeContainerId === null
        ) {
            throw new Error("Ship has no active unloading operation.");
        }

        const containerId = ship.activeContainerId;
        const container = this.containers.get(containerId);

        if (
            !container ||
            container.status !== "onShip" ||
            container.shipId !== shipId ||
            ship.peekTop() !== containerId
        ) {
            throw new Error("Container and ship records are inconsistent.");
        }

        ship.unload();

        const existing = this.containersByShip.get(shipId) ?? [];
        this.containersByShip.set(
            shipId,
            existing.filter(id => id !== containerId)
        );

        container.status = "inYard";
        container.shipId = null;

        this.yard.set(containerId, container);
        this.yardQueue.enqueue(containerId);

        this.unloadStack.push({ shipId, containerId });

        ship.status = "ready";
        ship.activeContainerId = null;
        ship.progress = 0;
        ship.operationStartedAt = null;

        return { shipId, containerId };
    }

    undoUnload() {
        const record = this.unloadStack.peek();

        if (record === null) {
            return null;
        }

        const { shipId, containerId } = record;
        const ship = this.ships.get(shipId);
        const container = this.containers.get(containerId);

        if (
            !ship ||
            ship.status === "departed" ||
            ship.status === "loading" ||
            ship.status === "unloading" ||
            !container ||
            !this.yard.has(containerId)
        ) {
            throw new Error("Cannot undo this unload in the current state.");
        }

        if (ship.isFull()) {
            throw new Error("Ship has reached its cargo capacity.");
        }

        if (!ship.load(containerId)) {
            throw new Error("Could not restore container to ship.");
        }

        this.yard.delete(containerId);

        const remainingIds = this.yardQueue
            .toArray()
            .filter(id => id !== containerId);

        this.yardQueue = new Queue();

        for (const id of remainingIds) {
            this.yardQueue.enqueue(id);
        }

        container.status = "onShip";
        container.shipId = shipId;

        const existing = this.containersByShip.get(shipId) ?? [];
        this.containersByShip.set(
            shipId,
            [...existing, containerId]
        );

        this.unloadStack.pop();

        return containerId;
    }

    findContainer(containerId) {
        const container = this.containers.get(containerId);

        if (!container) {
            return null;
        }

        return {
            weight: container.weight,
            dest: container.dest
        };
    }

    containersOfShip(shipId) {
        const ship = this.ships.get(shipId);

        if (!ship) {
            return [];
        }

        return ship.listContainers()
            .map(id => this.containers.get(id))
            .filter(container => container !== undefined)
            .map(container => ({
                id: container.id,
                weight: container.weight,
                dest: container.dest,
                status: container.status,
                shipId: container.shipId
            }));
    }

    _shipNeighbour(shipId, relation) {
        const ship = this.ships.get(shipId);
        if (!ship) return null;
        return {
            id: ship.id,
            name: ship.name,
            priority: ship.priority,
            state: ship.status,
            relation
        };
    }

    shipDetails(shipId) {
        const ship = this.ships.get(shipId);

        if (!ship) {
            return null;
        }

        let lineId = null;
        let previous = null;
        let next = null;

        const line = this.lines.find(
            l =>
                l.currentShipId === shipId ||
                l.ships.items.some(entry => entry.value === shipId)
        );

        if (line) {
            lineId = line.id;

            const ordered = [];
            if (line.currentShipId) ordered.push(line.currentShipId);

            const waiting = line.ships.items
                .slice()
                .sort((a, b) => a.priority - b.priority || a.seq - b.seq);

            for (const entry of waiting) ordered.push(entry.value);

            const idx = ordered.indexOf(shipId);

            if (idx > 0) {
                const isImmediatelyBehindActive =
                    idx === 1 && line.currentShipId === ordered[0];
                previous = this._shipNeighbour(
                    ordered[idx - 1],
                    isImmediatelyBehindActive
                        ? "Currently docked"
                        : "Ahead in line"
                );
            }

            if (idx >= 0 && idx < ordered.length - 1) {
                next = this._shipNeighbour(
                    ordered[idx + 1],
                    "Waiting behind"
                );
            }
        } else if (ship.status === "parked") {
            const ordered = this.parkedQueue
                .toArray()
                .map(id => this.ships.get(id))
                .filter(s => s)
                .sort((a, b) => a.priority - b.priority);

            const idx = ordered.findIndex(s => s.id === shipId);

            if (idx > 0) {
                previous = this._shipNeighbour(
                    ordered[idx - 1].id,
                    "Higher priority parked"
                );
            }

            if (idx >= 0 && idx < ordered.length - 1) {
                next = this._shipNeighbour(
                    ordered[idx + 1].id,
                    "Lower priority parked"
                );
            }
        } else if (ship.status === "atSea") {
            const ordered = this.atSeaQueue.items
                .slice()
                .sort((a, b) => a.priority - b.priority || a.seq - b.seq);

            const idx = ordered.findIndex(e => e.value === shipId);

            if (idx > 0) {
                previous = this._shipNeighbour(
                    ordered[idx - 1].value,
                    "Higher priority at sea"
                );
            }

            if (idx >= 0 && idx < ordered.length - 1) {
                next = this._shipNeighbour(
                    ordered[idx + 1].value,
                    "Lower priority at sea"
                );
            }
        } else if (ship.status === "departed") {
            previous = ship.lastPrevious;
            next = ship.lastNext;
        }

        return {
            type: "Ship",
            id: ship.id,
            name: ship.name,
            priority: ship.priority,
            priorityLabel: PRIORITY_LABELS[ship.priority] ?? "Unknown",
            state: ship.status,
            arrivalTime: ship.arrivalTime,
            departureTime: ship.departureTime,
            capacity: ship.capacity,
            used: ship.containerCount(),
            containers: ship.listContainers(),
            activeContainerId: ship.activeContainerId,
            progress: ship.progress,
            lineId,
            previous,
            next
        };
    }

    _containerNeighbour(containerId, relation) {
        const c = this.containers.get(containerId);
        if (!c) return null;
        return {
            id: c.id,
            weight: c.weight,
            dest: c.dest,
            relation
        };
    }

    containerDetails(containerId) {
        const container = this.containers.get(containerId);

        if (!container) {
            return null;
        }

        const ship = container.shipId
            ? this.ships.get(container.shipId)
            : null;

        let location = "Unknown";
        let previous = null;
        let next = null;

        if (
            container.status === "inYard" &&
            this.yardQueue.toArray().includes(containerId)
        ) {
            location = "Container Yard";
            const queue = this.yardQueue.toArray();
            const idx = queue.indexOf(containerId);

            if (idx > 0) {
                previous = this._containerNeighbour(
                    queue[idx - 1],
                    "Added earlier"
                );
            }

            if (idx < queue.length - 1) {
                next = this._containerNeighbour(
                    queue[idx + 1],
                    "Added later"
                );
            }
        } else if (ship) {
            location = ship.status === "departed"
                ? `Departed on ship ${ship.id}`
                : `On ship ${ship.id}`;

            const stack = ship.listContainers();
            const idx = stack.indexOf(containerId);

            if (idx > 0) {
                previous = this._containerNeighbour(
                    stack[idx - 1],
                    "Above (unloads first)"
                );
            }

            if (idx >= 0 && idx < stack.length - 1) {
                next = this._containerNeighbour(
                    stack[idx + 1],
                    "Below"
                );
            }
        }

        return {
            type: "Container",
            id: container.id,
            weight: container.weight,
            dest: container.dest,
            status: container.status,
            shipId: container.shipId,
            location,
            previous,
            next,
            lastYardPrevious: container.lastYardPrevious,
            lastYardNext: container.lastYardNext
        };
    }

    topHeaviest(k) {
        if (!Number.isInteger(k) || k <= 0) {
            return [];
        }

        const heap = new MinHeap(
            (a, b) =>
                a.weight - b.weight ||
                b.id.localeCompare(a.id)
        );

        for (const container of this.containers.values()) {
            if (heap.size() < k) {
                heap.insert(container);
                continue;
            }

            const lightest = heap.peek();

            const isHeavier =
                container.weight > lightest.weight;

            const winsTie =
                container.weight === lightest.weight &&
                container.id.localeCompare(lightest.id) < 0;

            if (isHeavier || winsTie) {
                heap.extractMin();
                heap.insert(container);
            }
        }

        const result = [];

        while (!heap.isEmpty()) {
            const container = heap.extractMin();
            result.push([container.id, container.weight]);
        }

        return result.reverse();
    }

    dockingHistory() {
        return this.dockingHistoryStack.toArray();
    }

    yardContents() {
        return this.yardQueue.toArray()
            .map(id => this.yard.get(id))
            .filter(container => container !== undefined)
            .map(container => ({
                id: container.id,
                weight: container.weight,
                dest: container.dest
            }));
    }

    shipsSortedByArrival() {
        return this.arrivalIndex.inorder()
            .map(entry => entry.value);
    }

    shipsInArrivalRange(t1, t2) {
        if (t1 > t2) {
            return [];
        }

        return this.arrivalIndex
            .range([t1, ""], [t2, "\uffff"])
            .map(entry => entry.value);
    }

    reachableDestinations(start) {
        return this.destGraph.reachableFrom(start);
    }

    searchContainersByPrefix(prefix) {
        return this.containerTrie.searchPrefix(prefix);
    }

    searchShipsByPrefix(prefix) {
        return this.shipTrie.searchPrefix(prefix);
    }

    uniqueDestinations() {
        const result = new Set();

        for (const destination of this.uniqueDestSet.values()) {
            result.add(destination);
        }

        return result;
    }

    snapshot() {
        const atSeaEntries = this.atSeaQueue.items
            .slice()
            .sort(
                (a, b) =>
                    a.priority - b.priority ||
                    a.seq - b.seq
            );

        const atSea = atSeaEntries
            .map(entry => {
                const ship = this.ships.get(entry.value);

                if (!ship) {
                    return null;
                }

                return {
                    id: ship.id,
                    name: ship.name,
                    priority: ship.priority
                };
            })
            .filter(ship => ship !== null);

        const lines = this.lines.map(line =>
            line.snapshot(this)
        );

        const yard = this.yardContents().map(container => ({
            id: container.id,
            weight: container.weight
        }));

        const parkedIds = this.parkedQueue.toArray();

        let nextParkedId = null;
        let nextParkedPriority = Infinity;
        for (const id of parkedIds) {
            const s = this.ships.get(id);
            if (!s) continue;
            if (s.priority < nextParkedPriority) {
                nextParkedPriority = s.priority;
                nextParkedId = id;
            }
        }

        const parked = parkedIds
            .map(id => this.ships.get(id))
            .filter(ship => ship !== undefined && ship !== null)
            .map(ship => ({
                id: ship.id,
                name: ship.name,
                priority: ship.priority,
                canResume: ship.id === nextParkedId
            }));

        const routes = [];

        for (const from of this.destGraph.adj.keys()) {
            for (const to of this.destGraph.neighbors(from)) {
                if (String(from) <= String(to)) {
                    routes.push([from, to]);
                }
            }
        }

        routes.sort((a, b) =>
            String(a[0]).localeCompare(String(b[0])) ||
            String(a[1]).localeCompare(String(b[1]))
        );

        return {
            simTime: this.simTime,
            lines,
            atSea,
            parked,
            yard,
            destinations: {
                unique: this.uniqueDestinations()
                    .values()
                    .sort(),
                routes
            }
        };
    }
}