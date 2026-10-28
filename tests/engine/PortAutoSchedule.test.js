import test from "node:test";
import assert from "node:assert/strict";
import { Engine } from "../../src/engine/Engine.js";

test("running simulation loads a docked ship to capacity then departs it", () => {
    const engine = new Engine(100);

    engine.addShip("S1", "Neptune", 1, 2, 2);
    engine.shipArrives("S1", 1);

    engine.addContainer("C1", 20, "A");
    engine.addContainer("C2", 15, "A");
    engine.addContainer("C3", 10, "A");

    engine.start();
    for (let i = 0; i < 100; i++) {
        engine.tick();
    }
    engine.stop();

    const ship = engine.port.ships.get("S1");

    assert.equal(ship.status, "departed");
    assert.equal(ship.containerCount(), 2);
    assert.deepEqual(engine.port.yardQueue.toArray(), ["C3"]);
});

test("a ship with pre-loaded cargo unloads then loads and departs with partial cargo", () => {
    const engine = new Engine(100);

    engine.addShip("S1", "Atlas", 1, 2, 3);
    engine.shipArrives("S1", 1);

    const ship = engine.port.ships.get("S1");
    ship.load("C1");
    ship.load("C2");
    ship.operationMode = "unload";

    engine.port.containers.set("C1", {
        id: "C1", weight: 20, dest: "A",
        status: "onShip", shipId: "S1"
    });
    engine.port.containers.set("C2", {
        id: "C2", weight: 15, dest: "A",
        status: "onShip", shipId: "S1"
    });

    engine.start();
    for (let i = 0; i < 150; i++) {
        engine.tick();
    }
    engine.stop();

    assert.equal(ship.status, "departed");
    assert.equal(ship.containerCount(), 2);
    assert.equal(engine.port.yard.has("C1"), false);
    assert.equal(engine.port.yard.has("C2"), false);
    assert.equal(engine.port.containers.get("C1").status, "onShip");
    assert.equal(engine.port.containers.get("C2").status, "onShip");
});

test("loading in one line does not block departure in another", () => {
    const engine = new Engine(100);

    engine.addShip("S1", "Neptune", 1, 2, 2);
    engine.shipArrives("S1", 1);

    engine.addShip("S2", "Atlas", 2, 2, 1);
    engine.shipArrives("S2", 2);

    engine.addContainer("C1", 20, "A");
    engine.addContainer("C2", 15, "A");
    engine.addContainer("C3", 10, "A");

    engine.start();
    for (let i = 0; i < 100; i++) {
        engine.tick();
    }
    engine.stop();

    assert.equal(engine.port.ships.get("S1").status, "departed");
    assert.equal(engine.port.ships.get("S2").status, "departed");
    assert.equal(engine.port.yardQueue.size(), 0);
});

test("manual depart during load is rejected but auto-depart after completion works", () => {
    const engine = new Engine(100);
    engine.addShip("S1", "Neptune", 1, 2, 1);
    engine.shipArrives("S1", 1);
    engine.addContainer("C1", 20, "A");

    engine.startLoading("S1", "C1");

    assert.throws(
        () => engine.depart("S1"),
        /cannot depart while loading/
    );

    engine.start();
    for (let i = 0; i < 100; i++) {
        engine.tick();
    }
    engine.stop();

    assert.equal(engine.port.ships.get("S1").status, "departed");
});