
import test from "node:test";
import assert from "node:assert/strict";
import { Port } from "../../src/engine/Port.js";

test("ships distribute across the shortest lines", () => {
    const port = new Port();

    for (let i = 1; i <= 5; i++) {
        port.addShip(`S${i}`, `Ship ${i}`, i);
        port.shipArrives(`S${i}`);
    }

    assert.deepEqual(
        port.lines.map(line => line.size()),
        [2, 1, 1, 1]
    );

    assert.equal(port.lines[0].currentShipId, "S1");
});

test("emergency ship moves ahead of normal waiting ships", () => {
    const port = new Port();

    for (let i = 1; i <= 8; i++) {
        port.addShip(`N${i}`, `Normal ${i}`, i);
        port.shipArrives(`N${i}`);
    }

    port.addShip("E1", "Emergency", 9, -1);
    const result = port.shipArrives("E1");

    assert.equal(result.lineId, 1);
    assert.equal(port.lines[0].currentShipId, "N1");
    assert.equal(port.lines[0].peek(), "E1");
});

test("ships overflow when all 32 line spaces are full", () => {
    const port = new Port();

    for (let i = 1; i <= 33; i++) {
        port.addShip(`S${i}`, `Ship ${i}`, i);
        port.shipArrives(`S${i}`);
    }

    assert.deepEqual(
        port.lines.map(line => line.size()),
        [8, 8, 8, 8]
    );

    assert.equal(port.atSeaQueue.size(), 1);
    assert.equal(port.atSeaQueue.peek().value, "S33");
});
