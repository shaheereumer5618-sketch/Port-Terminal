
import test from "node:test";
import assert from "node:assert/strict";
import { Engine } from "../../src/engine/Engine.js";

test("Engine advances loading progress and completes loading", () => {
    const engine = new Engine(100);

    engine.addShip("S1", "Neptune", 1);
    engine.shipArrives("S1");
    engine.addContainer("C1", 20, "A");

    let lastProgress = 0;

    engine.bus.on("ship:progress", event => {
        lastProgress = event.progress;
    });

    engine.startLoading("S1", "C1");

    for (let i = 0; i < 10; i++) {
        engine.tick();
    }

    assert.equal(lastProgress, 0.5);
    assert.equal(engine.port.ships.get("S1").status, "loading");

    for (let i = 0; i < 10; i++) {
        engine.tick();
    }

    assert.equal(engine.port.ships.get("S1").status, "ready");
    assert.equal(engine.port.containers.get("C1").status, "onShip");
    assert.equal(engine.port.ships.get("S1").peekTop(), "C1");
});

test("speed control accepts only supported speeds", () => {
    const engine = new Engine();

    engine.setSpeed(2);
    assert.equal(engine.speed, 2);

    assert.throws(() => engine.setSpeed(3));
});

test("EventBus delivers events and removes listeners", () => {
    const engine = new Engine();
    let calls = 0;

    const listener = () => {
        calls++;
    };

    engine.bus.on("example", listener);
    engine.bus.emit("example", {});
    engine.bus.off("example", listener);
    engine.bus.emit("example", {});

    assert.equal(calls, 1);
});
