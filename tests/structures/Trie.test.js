
import test from "node:test";
import assert from "node:assert/strict";
import { Trie } from "../../src/structures/Trie.js";

test("Trie searches exact IDs and prefixes", () => {
    const trie = new Trie();

    trie.insert("C1");
    trie.insert("C2");
    trie.insert("C10");
    trie.insert("C11");

    assert.equal(trie.search("C1"), true);
    assert.equal(trie.search("C"), false);

    assert.deepEqual(
        trie.searchPrefix("C1"),
        ["C1", "C10", "C11"]
    );

    assert.deepEqual(
        trie.searchPrefix("C"),
        ["C1", "C2", "C10", "C11"]
    );

    assert.deepEqual(trie.searchPrefix("X"), []);
    assert.equal(trie.startsWith("C1"), true);
    assert.equal(trie.startsWith("X"), false);
});
