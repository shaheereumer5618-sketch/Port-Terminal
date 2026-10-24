
import test from "node:test";
import assert from "node:assert/strict";
import { Queue } from "../../src/structures/Queue.js";

test("new Queue is empty", () => {
    const queue = new Queue();

    assert.equal(queue.isEmpty(), true);
    assert.equal(queue.size(), 0);
    assert.equal(queue.peek(), null);
    assert.equal(queue.dequeue(), null);
});

test("Queue removes items in FIFO order", () => {
    const queue = new Queue();

    queue.enqueue("C1");
    queue.enqueue("C2");
    queue.enqueue("C3");

    assert.equal(queue.dequeue(), "C1");
    assert.equal(queue.dequeue(), "C2");
    assert.equal(queue.dequeue(), "C3");
    assert.equal(queue.isEmpty(), true);
});

test("peek does not remove the front item", () => {
    const queue = new Queue();

    queue.enqueue("C1");
    queue.enqueue("C2");

    assert.equal(queue.peek(), "C1");
    assert.equal(queue.size(), 2);
});

test("Queue works after becoming empty", () => {
    const queue = new Queue();

    queue.enqueue("C1");
    queue.dequeue();
    queue.enqueue("C2");

    assert.equal(queue.dequeue(), "C2");
});

test("toArray returns the remaining items", () => {
    const queue = new Queue();

    queue.enqueue("C1");
    queue.enqueue("C2");
    queue.dequeue();

    assert.deepEqual(queue.toArray(), ["C2"]);
});
