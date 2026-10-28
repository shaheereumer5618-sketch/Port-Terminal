import test from "node:test";
import assert from "node:assert/strict";
import { Port } from "../../src/engine/Port.js";

test("departed ship is removed from its active position", () => {
    const port = new Port();

    port.addShip("S1", "Neptune", 1);
    port.shipArrives("S1");

    const result = port.depart("S1");

    assert.equal(result.shipId, "S1");
    assert.equal(port.ships.get("S1").status, "departed");
    assert.equal(port.lines[0].currentShipId, null);
});

test("departing ship promotes the highest-priority waiter", () => {
    const port = new Port();

    for (let i = 1; i <= 8; i++) {
        port.addShip(`N${i}`, `Normal ${i}`, i);
        port.shipArrives(`N${i}`);
    }

    port.addShip("E1", "Emergency", 9, -1);
    port.shipArrives("E1");

    const result = port.depart("N1");

    assert.equal(result.nextShipId, "E1");
    assert.equal(port.lines[0].currentShipId, "E1");
});

test("a ship carrying cargo can depart with cargo still on board", () => {
    const port = new Port();

    port.addShip("S1", "Neptune", 1);
    port.shipArrives("S1");

    port.ships.get("S1").load("C1");

    const result = port.depart("S1");

    assert.equal(result.shipId, "S1");
    assert.equal(port.ships.get("S1").status, "departed");
    assert.equal(port.lines[0].currentShipId, null);
});

test("departure allows the most urgent overflowed ship to enter", () => {
    const port = new Port();

    for (let i = 1; i <= 32; i++) {
        port.addShip(`S${i}`, `Ship ${i}`, i);
        port.shipArrives(`S${i}`);
    }

    port.addShip("N33", "Normal", 33);
    port.shipArrives("N33");

    port.addShip("E1", "Emergency", 34, -1);
    port.shipArrives("E1");

    port.depart("S1");

    assert.equal(port.atSeaQueue.size(), 1);
    assert.equal(port.atSeaQueue.peek().value, "N33");

    assert.equal(
        port.lines[0].ships.items.some(
            entry => entry.value === "E1"
        ),
        true
    );
});