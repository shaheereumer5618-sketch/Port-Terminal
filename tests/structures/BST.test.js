
import test from "node:test";
import assert from "node:assert/strict";
import { BST } from "../../src/structures/BST.js";

test("BST returns entries in sorted order", () => {
    const bst = new BST();

    bst.insert([30, "S3"], "S3");
    bst.insert([10, "S1"], "S1");
    bst.insert([20, "S2"], "S2");

    assert.deepEqual(
        bst.inorder().map(entry => entry.value),
        ["S1", "S2", "S3"]
    );
});

test("BST searches for an exact key", () => {
    const bst = new BST();

    bst.insert([20, "S2"], "S2");

    assert.equal(bst.search([20, "S2"]), "S2");
    assert.equal(bst.search([25, "S4"]), null);
});

test("BST returns a key range", () => {
    const bst = new BST();

    bst.insert([10, "S1"], "S1");
    bst.insert([20, "S2"], "S2");
    bst.insert([30, "S3"], "S3");

    assert.deepEqual(
        bst.range([10, "S1"], [20, "S2"])
            .map(entry => entry.value),
        ["S1", "S2"]
    );
});

test("BST finds minimum and maximum", () => {
    const bst = new BST();

    bst.insert([20, "S2"], "S2");
    bst.insert([10, "S1"], "S1");
    bst.insert([30, "S3"], "S3");

    assert.equal(bst.min().value, "S1");
    assert.equal(bst.max().value, "S3");
});
