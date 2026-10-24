
import test from "node:test";
import assert from "node:assert/strict";
import { Stack } from "../../src/structures/Stack.js";

test("a new Stack is empty", () => {
    const stack = new Stack();

    assert.equal(stack.isEmpty(), true);
    assert.equal(stack.size(), 0);
    assert.equal(stack.peek(), null);
    assert.equal(stack.pop(), null);
});

test("push adds items and peek does not remove them", () => {
    const stack = new Stack();

    stack.push("C1");
    stack.push("C2");

    assert.equal(stack.peek(), "C2");
    assert.equal(stack.size(), 2);
});

test("pop removes items in LIFO order", () => {
    const stack = new Stack();

    stack.push("C1");
    stack.push("C2");
    stack.push("C3");

    assert.equal(stack.pop(), "C3");
    assert.equal(stack.pop(), "C2");
    assert.equal(stack.pop(), "C1");

    assert.equal(stack.isEmpty(), true);
});

test("toArray returns a copy", () => {
    const stack = new Stack();

    stack.push("C1");
    stack.push("C2");

    const result = stack.toArray();
    result.push("C3");

    assert.deepEqual(stack.toArray(), ["C1", "C2"]);
});
