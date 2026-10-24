
import test from "node:test";
import assert from "node:assert/strict";
import { PriorityQueue } from "../../src/structures/PriorityQueue.js";

test("priority and sequence determine removal order", () => {
    const pq = new PriorityQueue();

    pq.push(2, 5, "N5");
    pq.push(-1, 9, "E1");
    pq.push(2, 6, "N6");
    pq.push(0, 10, "C1");

    assert.equal(pq.pop().value, "E1");
    assert.equal(pq.pop().value, "C1");
    assert.equal(pq.pop().value, "N5");
    assert.equal(pq.pop().value, "N6");
});

test("empty queue returns null", () => {
    const pq = new PriorityQueue();

    assert.equal(pq.pop(), null);
    assert.equal(pq.peek(), null);
    assert.equal(pq.isEmpty(), true);
});

test("peek does not remove the top entry", () => {
    const pq = new PriorityQueue();

    pq.push(2, 5, "N5");
    pq.push(-1, 9, "E1");

    assert.equal(pq.peek().value, "E1");
    assert.equal(pq.size(), 2);
});
