
import test from "node:test";
import assert from "node:assert/strict";
import { HashMap } from "../../src/structures/HashMap.js";

test("HashMap stores and retrieves values", () => {
    const map = new HashMap();

    map.set("S1", "Neptune");
    map.set("S2", "Ocean Star");

    assert.equal(map.get("S1"), "Neptune");
    assert.equal(map.get("S2"), "Ocean Star");
    assert.equal(map.size(), 2);
});

test("HashMap updates an existing key", () => {
    const map = new HashMap();

    map.set("S1", "Neptune");
    map.set("S1", "New Name");

    assert.equal(map.get("S1"), "New Name");
    assert.equal(map.size(), 1);
});

test("HashMap handles collisions", () => {
    const map = new HashMap();

    map.set("Aa", "First");
    map.set("BB", "Second");

    assert.equal(map.hash("Aa"), map.hash("BB"));
    assert.equal(map.get("Aa"), "First");
    assert.equal(map.get("BB"), "Second");
});

test("HashMap checks and deletes keys", () => {
    const map = new HashMap();

    map.set("C1", 20);

    assert.equal(map.has("C1"), true);
    assert.equal(map.delete("C1"), true);
    assert.equal(map.has("C1"), false);
    assert.equal(map.size(), 0);
});

test("HashMap resizes as it fills", () => {
    const map = new HashMap();

    for (let i = 0; i < 20; i++) {
        map.set(`S${i}`, i);
    }

    assert.ok(map.capacity > 16);
    assert.equal(map.get("S10"), 10);
    assert.equal(map.size(), 20);
});
