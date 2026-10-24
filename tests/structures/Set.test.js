
import test from "node:test";
import assert from "node:assert/strict";
import { Set } from "../../src/structures/Set.js";

test("Set stores only unique values", () => {
    const set = new Set();

    set.add("A");
    set.add("B");
    set.add("A");

    assert.equal(set.size(), 2);
    assert.equal(set.has("A"), true);
    assert.deepEqual(set.values().sort(), ["A", "B"]);
});

test("Set deletes values", () => {
    const set = new Set();

    set.add("A");

    assert.equal(set.delete("A"), true);
    assert.equal(set.delete("A"), false);
    assert.equal(set.size(), 0);
});
