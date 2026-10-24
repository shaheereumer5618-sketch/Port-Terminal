
import test from "node:test";
import assert from "node:assert/strict";
import { Container } from "../../src/domain/Container.js";

test("Container initializes with correct values", () => {
    const c1 = new Container("C1", 20, "A");

    assert.equal(c1.id, "C1");
    assert.equal(c1.weight, 20);
    assert.equal(c1.dest, "A");
    assert.equal(c1.status, "inYard");
    assert.equal(c1.shipId, null);
});
