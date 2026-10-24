
import { HashMap } from "./HashMap.js";
import { Queue } from "./Queue.js";
import { Set } from "./Set.js";

export class Graph {
    constructor() {
        this.adj = new HashMap();
    }

    addNode(node) {
        if (!this.adj.has(node)) {
            this.adj.set(node, []);
        }
    }

    addEdge(a, b) {
        this.addNode(a);
        this.addNode(b);

        const aNeighbors = this.adj.get(a);
        const bNeighbors = this.adj.get(b);

        if (!aNeighbors.includes(b)) {
            aNeighbors.push(b);
        }

        if (!bNeighbors.includes(a)) {
            bNeighbors.push(a);
        }
    }

    neighbors(node) {
        return this.adj.get(node) ?? [];
    }

    bfs(start) {
        if (!this.adj.has(start)) {
            return [];
        }

        const visited = new Set();
        const queue = new Queue();
        const order = [];

        visited.add(start);
        queue.enqueue(start);

        while (!queue.isEmpty()) {
            const current = queue.dequeue();
            order.push(current);

            for (const neighbor of this.neighbors(current)) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.enqueue(neighbor);
                }
            }
        }

        return order;
    }

    reachableFrom(start) {
        const result = new Set();

        for (const node of this.bfs(start)) {
            result.add(node);
        }

        return result;
    }

    shortestPath(start, end) {
        if (!this.adj.has(start) || !this.adj.has(end)) {
            return [];
        }

        const visited = new Set();
        const queue = new Queue();
        const previous = new HashMap();

        visited.add(start);
        queue.enqueue(start);
        previous.set(start, null);

        while (!queue.isEmpty()) {
            const current = queue.dequeue();

            if (current === end) {
                break;
            }

            for (const neighbor of this.neighbors(current)) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    previous.set(neighbor, current);
                    queue.enqueue(neighbor);
                }
            }
        }

        if (!visited.has(end)) {
            return [];
        }

        const path = [];
        let current = end;

        while (current !== null) {
            path.push(current);
            current = previous.get(current);
        }

        return path.reverse();
    }
}
