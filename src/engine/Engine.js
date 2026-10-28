import { Port } from "./Port.js";
import { EventBus } from "./EventBus.js";

export class Engine {
    constructor(tickMs = 100) {
        this.port = new Port();
        this.bus = new EventBus();

        this.tickMs = tickMs;
        this.speed = 1;
        this.running = false;
        this.timer = null;
    }

    _ensureTimer() {
        if (this.timer === null) {
            this.timer = setInterval(() => {
                this.tick();
            }, this.tickMs);
        }
    }

    _maybeStopTimer() {
        // Keep the timer alive while the simulation is running OR
        // while any ship is mid-operation.
        if (this.running) return;
        if (this.timer === null) return;

        for (const ship of this.port.ships.values()) {
            if (
                ship.status === "loading" ||
                ship.status === "unloading"
            ) {
                return;
            }
        }

        clearInterval(this.timer);
        this.timer = null;
    }

    start() {
        if (this.running) {
            return;
        }

        this.running = true;
        this._ensureTimer();
    }

    stop() {
        this.running = false;
        this._maybeStopTimer();
    }

    setSpeed(multiplier) {
        const allowedSpeeds = [0.5, 1, 2, 4];

        if (!allowedSpeeds.includes(multiplier)) {
            throw new Error("Speed must be 0.5, 1, 2, or 4.");
        }

        this.speed = multiplier;
    }

    tick() {
        this.port.simTime += this.tickMs * this.speed;

        for (const ship of this.port.ships.values()) {
            if (
                ship.status !== "loading" &&
                ship.status !== "unloading"
            ) {
                continue;
            }

            const elapsed =
                this.port.simTime - ship.operationStartedAt;

            const durationMs = 2000;

            ship.progress = Math.min(1, elapsed / durationMs);

            this.bus.emit("ship:progress", {
                shipId: ship.id,
                containerId: ship.activeContainerId,
                progress: ship.progress
            });

            if (ship.progress === 1) {
                const shipId = ship.id;
                const containerId = ship.activeContainerId;
                const wasLoading = ship.status === "loading";

                if (wasLoading) {
                    this.port.completeLoading(shipId);
                    this.bus.emit("ship:loadingFinished", {
                        shipId,
                        containerId
                    });
                } else {
                    this.port.completeUnloading(shipId);
                    this.bus.emit("ship:unloadingFinished", {
                        shipId,
                        containerId
                    });
                }

                this._emitLineUpdates();
            }
        }

        if (this.running) {
            this._autoSchedule();
        }

        this.bus.emit("engine:tick", {
            simTime: this.port.simTime
        });

        this._maybeStopTimer();
    }

    _autoSchedule() {
        if (
            !this.port.yardQueue.isEmpty() &&
            !this.port.parkedQueue.isEmpty()
        ) {
            const parkedIds = this.port.parkedQueue.toArray();
            let bestId = null;
            let bestPriority = Infinity;

            for (const id of parkedIds) {
                const s = this.port.ships.get(id);
                if (!s) continue;
                if (s.priority < bestPriority) {
                    bestPriority = s.priority;
                    bestId = id;
                }
            }

            if (bestId !== null) {
                const emptyLine = this.port.lines.find(
                    l => l.currentShipId === null
                );

                if (emptyLine) {
                    try {
                        this.unpark(bestId, emptyLine.id);
                    } catch (error) {
                        this.bus.emit("engine:error", {
                            lineId: emptyLine.id,
                            shipId: bestId,
                            message:
                                error instanceof Error
                                    ? error.message
                                    : String(error)
                        });
                    }
                }
            }
        }

        for (const line of this.port.lines) {
            if (line.currentShipId === null) {
                continue;
            }

            const ship = this.port.ships.get(line.currentShipId);

            if (!ship) {
                continue;
            }

            if (
                ship.status === "loading" ||
                ship.status === "unloading"
            ) {
                continue;
            }

            if (ship.status !== "docked" && ship.status !== "ready") {
                continue;
            }

            try {
                if (ship.operationMode === "unload") {
                    if (!ship.isEmpty()) {
                        this.startUnloading(ship.id);
                    } else if (!this.port.yardQueue.isEmpty()) {
                        ship.operationMode = "load";
                        this.startLoading(
                            ship.id,
                            this.port.yardQueue.peek()
                        );
                    } else {
                        this.park(ship.id);
                    }
                } else if (ship.operationMode === "load") {
                    if (ship.isFull()) {
                        this.depart(ship.id);
                    } else if (!this.port.yardQueue.isEmpty()) {
                        const nextId = this.port.yardQueue.peek();
                        const inUse = [...this.port.ships.values()].some(
                            s => s.activeContainerId === nextId
                        );
                        if (!inUse) {
                            this.startLoading(ship.id, nextId);
                        }
                    } else if (ship.containerCount() > 0) {
                        this.depart(ship.id);
                    } else {
                        this.park(ship.id);
                    }
                }
            } catch (error) {
                this.bus.emit("engine:error", {
                    lineId: line.id,
                    shipId: ship.id,
                    message:
                        error instanceof Error
                            ? error.message
                            : String(error)
                });
            }
        }
    }

    _emitLineUpdates() {
        for (const line of this.port.lines) {
            this.bus.emit("line:updated", {
                lineId: line.id,
                snapshot: line.snapshot(this.port)
            });
        }
    }

    addShip(...args) {
        const ship = this.port.addShip(...args);
        this.bus.emit("data:updated", { kind: "ship" });
        return ship;
    }

    addContainer(...args) {
        const container = this.port.addContainer(...args);
        this.bus.emit("data:updated", { kind: "container" });
        return container;
    }

    addRoute(...args) {
        const result = this.port.addRoute(...args);
        this.bus.emit("data:updated", { kind: "route" });
        return result;
    }

    shipArrives(shipId, requestedLineId = null) {
        const result = this.port.shipArrives(shipId, requestedLineId);

        if (result.overflown) {
            this.bus.emit("ship:overflown", { shipId });
        } else {
            this.bus.emit("ship:arrived", {
                shipId,
                lineId: result.lineId
            });
        }

        if (result.dockedShipId !== null) {
            this.bus.emit("ship:docked", {
                shipId: result.dockedShipId,
                lineId: result.lineId
            });
        }

        this._emitLineUpdates();
        return result;
    }

    startLoading(shipId, containerId) {
        const operation = this.port.startLoading(
            shipId,
            containerId
        );

        this.bus.emit("ship:loadingStarted", operation);
        this._ensureTimer();
        this._emitLineUpdates();

        return operation;
    }

    startUnloading(shipId) {
        const operation = this.port.startUnloading(shipId);

        this.bus.emit("ship:unloadingStarted", operation);
        this._ensureTimer();
        this._emitLineUpdates();

        return operation;
    }

    depart(shipId) {
        const result = this.port.depart(shipId);

        this.bus.emit("ship:departed", {
            shipId,
            lineId: result.lineId
        });

        if (result.nextShipId !== null) {
            this.bus.emit("ship:docked", {
                shipId: result.nextShipId,
                lineId: result.lineId
            });
        }

        if (result.overflowShipIdAssigned !== null) {
            const line = this.port.lines.find(
                candidate =>
                    candidate.currentShipId ===
                        result.overflowShipIdAssigned ||
                    candidate.ships.items.some(
                        entry =>
                            entry.value ===
                            result.overflowShipIdAssigned
                    )
            );

            if (line) {
                this.bus.emit("ship:arrived", {
                    shipId: result.overflowShipIdAssigned,
                    lineId: line.id
                });

                if (
                    line.currentShipId ===
                    result.overflowShipIdAssigned
                ) {
                    this.bus.emit("ship:docked", {
                        shipId: result.overflowShipIdAssigned,
                        lineId: line.id
                    });
                }
            }
        }

        this._emitLineUpdates();
        return result;
    }

    park(shipId) {
        const parkedId = this.port.parkShip(shipId);
        this.bus.emit("ship:parked", { shipId: parkedId });
        this.bus.emit("data:updated", { kind: "parking" });
        this._emitLineUpdates();
        return parkedId;
    }

    unpark(shipId, requestedLineId = null) {
        const result = this.port.unparkShip(shipId, requestedLineId);

        this.bus.emit("ship:unparked", {
            shipId,
            lineId: result.lineId
        });
        this.bus.emit("data:updated", { kind: "parking" });

        if (result.dockedShipId !== null) {
            this.bus.emit("ship:docked", {
                shipId: result.dockedShipId,
                lineId: result.lineId
            });
        }

        this._emitLineUpdates();
        return result;
    }

    shipDetails(shipId) {
        return this.port.shipDetails(shipId);
    }

    containerDetails(containerId) {
        return this.port.containerDetails(containerId);
    }

    getSnapshot() {
        return this.port.snapshot();
    }

    reachableDestinations(startDest) {
        return this.port.reachableDestinations(startDest);
    }

    searchContainersByPrefix(prefix) {
        return this.port.searchContainersByPrefix(prefix);
    }

    searchShipsByPrefix(prefix) {
        return this.port.searchShipsByPrefix(prefix);
    }

    shipsSortedByArrival() {
        return this.port.shipsSortedByArrival();
    }

    shipsInArrivalRange(startT, endT) {
        return this.port.shipsInArrivalRange(startT, endT);
    }

    uniqueDestinations() {
        return this.port.uniqueDestinations();
    }
}