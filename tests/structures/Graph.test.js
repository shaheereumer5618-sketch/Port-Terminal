
import test from "node:test";
import assert from "node:assert/strict";
import { Graph } from "../../src/structures/Graph.js";

test("Graph routes are undirected", () => {
    const graph = new Graph();

    graph.addEdge("A", "B");

    assert.deepEqual(graph.neighbors("A"), ["B"]);
    assert.deepEqual(graph.neighbors("B"), ["A"]);
});

test("BFS and reachability find connected destinations", () => {
    const graph = new Graph();

    graph.addEdge("A", "B");
    graph.addEdge("B", "C");

    assert.deepEqual(graph.bfs("A"), ["A", "B", "C"]);
    assert.deepEqual(
        graph.reachableFrom("A").values().sort(),
        ["A", "B", "C"]
    );
});

test("Graph handles cycles without repeated visits", () => {
    const graph = new Graph();

    graph.addEdge("A", "B");
    graph.addEdge("B", "C");
    graph.addEdge("C", "A");

    assert.deepEqual(graph.bfs("A").sort(), ["A", "B", "C"]);
});

test("Graph finds a shortest path", () => {
    const graph = new Graph();

    graph.addEdge("A", "B");
    graph.addEdge("B", "C");
    graph.addEdge("A", "C");

    assert.deepEqual(graph.shortestPath("A", "C"), ["A", "C"]);
});
