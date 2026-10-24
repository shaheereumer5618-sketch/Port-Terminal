
import test from "node:test";
import assert from "node:assert/strict";
import { Port } from "../../src/engine/Port.js";

test("snapshot contains the required port sections", () => {
    const port = new Port();

    port.addShip("S1", "Neptune", 10);
    port.shipArrives("S1");

    port.addContainer("C1", 20, "A");
    port.addRoute("A", "B");

    const snapshot = port.snapshot();

    assert.equal(snapshot.lines.length, 4);
    assert.equal(snapshot.lines[0].id, 1);
    assert.equal(snapshot.lines[0].ships[0].id, "S1");

    assert.deepEqual(snapshot.yard, [
        { id: "C1", weight: 20 }
    ]);

    assert.deepEqual(snapshot.destinations.unique, ["A"]);
    assert.deepEqual(snapshot.destinations.routes, [
        ["A", "B"]
    ]);

    assert.equal(typeof snapshot.simTime, "number");
});

test("modifying a snapshot does not change the Port", () => {
    const port = new Port();

    port.addShip("S1", "Neptune", 10);
    port.shipArrives("S1");

    const snapshot = port.snapshot();

    snapshot.lines[0].ships[0].name = "Changed name";

    assert.equal(port.ships.get("S1").name, "Neptune");
});
