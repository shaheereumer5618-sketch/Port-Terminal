
import test from "node:test";
import assert from "node:assert/strict";
import { Ship } from "../../src/domain/Ship.js";

test("Ship initializes correctly", () => {
    const ship = new Ship("S1", "Neptune", 100);

    assert.equal(ship.id, "S1");
    assert.equal(ship.priority, 2);
    assert.equal(ship.capacity, 10);
    assert.equal(ship.status, "atSea");
    assert.equal(ship.containerCount(), 0);
});

test("Ship loads and unloads in Stack order", () => {
    const ship = new Ship("S1", "Neptune", 100);

    ship.load("C1");
    ship.load("C2");
    ship.load("C3");

    assert.equal(ship.peekTop(), "C3");
    assert.equal(ship.unload(), "C3");
    assert.equal(ship.containerCount(), 2);
    assert.deepEqual(
        ship.listContainers(),
        ["C2", "C1"]
    );
});

test("Ship cannot exceed its capacity", () => {
    const ship = new Ship("S1", "Neptune", 100, 2, 2);

    assert.equal(ship.load("C1"), true);
    assert.equal(ship.load("C2"), true);
    assert.equal(ship.load("C3"), false);
    assert.equal(ship.containerCount(), 2);
});
