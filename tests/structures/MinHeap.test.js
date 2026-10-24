
import test from "node:test";
import assert from "node:assert/strict";
import { MinHeap } from "../../src/structures/MinHeap.js";

test("numbers are extracted from smallest to largest", () => {
    const heap = new MinHeap();

    heap.insert(10);
    heap.insert(20);
    heap.insert(5);
    heap.insert(3);

    assert.equal(heap.peek(), 3);
    assert.equal(heap.extractMin(), 3);
    assert.equal(heap.extractMin(), 5);
    assert.equal(heap.extractMin(), 10);
    assert.equal(heap.extractMin(), 20);
    assert.equal(heap.extractMin(), null);
});

test("MinHeap can compare container objects by weight", () => {
    const heap = new MinHeap((a, b) => a.weight - b.weight);

    heap.insert({ id: "C1", weight: 20 });
    heap.insert({ id: "C2", weight: 45 });
    heap.insert({ id: "C3", weight: 10 });

    assert.equal(heap.peek().id, "C3");
    assert.equal(heap.extractMin().id, "C3");
    assert.equal(heap.extractMin().id, "C1");
    assert.equal(heap.extractMin().id, "C2");
});

test("peek does not remove the minimum", () => {
    const heap = new MinHeap();

    heap.insert(8);
    heap.insert(2);

    assert.equal(heap.peek(), 2);
    assert.equal(heap.size(), 2);
});
