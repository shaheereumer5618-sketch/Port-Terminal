
import test from "node:test";
import assert from "node:assert/strict";
import { Port } from "../../src/engine/Port.js";

test("findContainer returns the expected details", () => {
    const port = new Port();

    port.addContainer("C4", 30, "C");

    assert.deepEqual(
        port.findContainer("C4"),
        { weight: 30, dest: "C" }
    );

    assert.equal(port.findContainer("missing"), null);
});

test("topHeaviest returns containers in descending weight order", () => {
    const port = new Port();

    port.addContainer("C1", 20, "A");
    port.addContainer("C2", 45, "B");
    port.addContainer("C3", 30, "C");
    port.addContainer("C4", 60, "D");

    assert.deepEqual(
        port.topHeaviest(2),
        [["C4", 60], ["C2", 45]]
    );
});

test("yardContents follows FIFO order", () => {
    const port = new Port();

    port.addContainer("C1", 20, "A");
    port.addContainer("C2", 30, "B");

    assert.deepEqual(
        port.yardContents().map(container => container.id),
        ["C1", "C2"]
    );
});

test("arrival queries return ships in sorted order", () => {
    const port = new Port();

    port.addShip("S3", "Gamma", 11);
    port.addShip("S1", "Alpha", 10);
    port.addShip("S2", "Beta", 12);

    assert.deepEqual(
        port.shipsSortedByArrival(),
        ["S1", "S3", "S2"]
    );

    assert.deepEqual(
        port.shipsInArrivalRange(10, 11),
        ["S1", "S3"]
    );
});

test("prefix search and unique destinations work", () => {
    const port = new Port();

    port.addShip("S1", "Neptune", 10);
    port.addContainer("C1", 20, "A");
    port.addContainer("C10", 8, "A");
    port.addContainer("C11", 6, "B");

    assert.deepEqual(
        port.searchContainersByPrefix("C1"),
        ["C1", "C10", "C11"]
    );

    assert.deepEqual(
        port.searchShipsByPrefix("S"),
        ["S1"]
    );

    assert.deepEqual(
        port.uniqueDestinations().values().sort(),
        ["A", "B"]
    );
});
