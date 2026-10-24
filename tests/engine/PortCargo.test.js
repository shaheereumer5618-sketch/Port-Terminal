
import test from "node:test";
import assert from "node:assert/strict";
import { Port } from "../../src/engine/Port.js";

test("loading moves a container from yard to ship", () => {
    const port = new Port();

    port.addShip("S1", "Neptune", 1);
    port.shipArrives("S1");
    port.addContainer("C1", 20, "A");

    port.startLoading("S1", "C1");
    port.completeLoading("S1");

    assert.equal(port.yard.has("C1"), false);
    assert.equal(port.ships.get("S1").peekTop(), "C1");
    assert.equal(port.containers.get("C1").status, "onShip");
    assert.equal(port.containers.get("C1").shipId, "S1");
});

test("unloading returns a container to the yard", () => {
    const port = new Port();

    port.addShip("S1", "Neptune", 1);
    port.shipArrives("S1");
    port.addContainer("C1", 20, "A");

    port.startLoading("S1", "C1");
    port.completeLoading("S1");

    port.startUnloading("S1");
    port.completeUnloading("S1");

    assert.equal(port.yard.has("C1"), true);
    assert.equal(port.containers.get("C1").status, "inYard");
    assert.equal(port.containers.get("C1").shipId, null);
});

test("undo restores the last unloaded container", () => {
    const port = new Port();

    port.addShip("S1", "Neptune", 1);
    port.shipArrives("S1");
    port.addContainer("C1", 20, "A");

    port.startLoading("S1", "C1");
    port.completeLoading("S1");

    port.startUnloading("S1");
    port.completeUnloading("S1");

    assert.equal(port.undoUnload(), "C1");
    assert.equal(port.yard.has("C1"), false);
    assert.equal(port.ships.get("S1").peekTop(), "C1");
    assert.equal(port.containers.get("C1").status, "onShip");
});
