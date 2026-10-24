
import test from "node:test";
import assert from "node:assert/strict";
import { Line } from "../../src/domain/Line.js";
import { Ship } from "./../../src/domain/Ship.js";

test("Line counts active and waiting ships", () => {
    const line = new Line(1, 3);

    const s1 = new Ship("S1", "Neptune", 10);
    const s2 = new Ship("S2", "Ocean Star", 11);
    const s3 = new Ship("S3", "Seafarer", 12);

    assert.equal(line.enqueue(s1, 1), true);
    assert.equal(line.advance(), "S1");

    assert.equal(line.enqueue(s2, 2), true);
    assert.equal(line.enqueue(s3, 3), true);

    assert.equal(line.size(), 3);
    assert.equal(line.isFull(), true);
    assert.equal(line.enqueue(
        new Ship("S4", "Harbor", 13), 4
    ), false);
});

test("Line promotes the highest-priority waiting ship", () => {
    const line = new Line(1, 4);

    const s1 = new Ship("S1", "Neptune", 10);
    const e1 = new Ship("E1", "Emergency", 11, -1);
    const n5 = new Ship("N5", "Normal", 12, 2);

    line.enqueue(s1, 1);
    line.advance();

    line.enqueue(n5, 2);
    line.enqueue(e1, 3);

    assert.equal(line.removeCurrentShip(), "S1");
    assert.equal(line.advance(), "E1");
    assert.equal(line.currentShipId, "E1");
    assert.equal(line.size(), 2);
});
