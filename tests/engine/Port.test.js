
import test from "node:test";
import assert from "node:assert/strict";
import { Port } from "../../src/engine/Port.js";

test("Port initializes its lines and structures", () => {
    const port = new Port();

    assert.equal(port.lines.length, 4);
    assert.equal(port.lines[0].capacity, 8);
    assert.equal(port.seq, 0);
    assert.equal(port.simTime, 0);
});

test("Port registers ships", () => {
    const port = new Port();
    const ship = port.addShip("S1", "Neptune", 10);

    assert.equal(port.ships.get("S1"), ship);
    assert.equal(port.arrivalIndex.search([10, "S1"]), "S1");
    assert.equal(port.shipTrie.search("S1"), true);
});

test("Port registers containers in the yard", () => {
    const port = new Port();
    const container = port.addContainer("C1", 20, "A");

    assert.equal(port.containers.get("C1"), container);
    assert.equal(port.yard.get("C1"), container);
    assert.deepEqual(port.yardQueue.toArray(), ["C1"]);
    assert.equal(port.containerTrie.search("C1"), true);
    assert.equal(port.uniqueDestSet.has("A"), true);
    assert.deepEqual(port.destGraph.bfs("A"), ["A"]);
});

test("Port rejects invalid priorities and duplicate IDs", () => {
    const port = new Port();

    assert.throws(
        () => port.addShip("S1", "Neptune", 10, 6)
    );

    port.addShip("S1", "Neptune", 10);

    assert.throws(
        () => port.addShip("S1", "Duplicate", 12)
    );

    port.addContainer("C1", 20, "A");

    assert.throws(
        () => port.addContainer("C1", 30, "B")
    );
});


