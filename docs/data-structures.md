
# Data Structures — Port Terminal Manager

This project implements nine custom data structures. Each one solves
a specific problem in the port simulation.

## 1. Stack

**Used for:** Ship cargo, docking history, and unload history.

A Stack follows LIFO (Last In, First Out). The last container loaded
onto a ship is the first container unloaded from it.

The same principle supports undoing the most recent unloading operation
and retrieving docking history.

**Main operations:** `push`, `pop`, `peek`

**Typical time complexity:** O(1) for push, pop, and peek.

## 2. Queue

**Used for:** The container yard.

A Queue follows FIFO (First In, First Out). The container that entered
the yard first is the next container selected for loading.

This maintains a consistent loading order.

**Main operations:** `enqueue`, `dequeue`, `peek`

**Time complexity:** O(1) for enqueue and dequeue in the implemented
front-index queue.

## 3. Priority Queue

**Used for:** Waiting ships in each docking line and ships waiting
at sea when the port is full.

Ships with lower numerical priority values are more urgent. For ships
with equal priority, the earlier sequence number determines their order.

This makes the most urgent eligible ship the next one promoted.

**Main operations:** `push`, `pop`, `peek`

**Time complexity:** O(log n) for insertion and removal; O(1) for peek.

## 4. HashMap

**Used for:** Finding ships, containers, yard contents, and other
records by their identifiers.

Instead of searching through every record, the application uses a
key such as a ship ID or container ID to locate its value efficiently.

**Main operations:** `set`, `get`, `has`, `delete`

**Typical time complexity:** O(1) average for lookup, insertion,
and deletion; O(n) worst case.

## 5. MinHeap

**Used for:** Finding the heaviest containers efficiently.

The application maintains a heap of the k heaviest candidates while
examining all containers. This avoids sorting every container when
only a small number of the heaviest results are requested.

**Main operations:** `insert`, `peek`, `extractMin`

**Time complexity:** O(log n) for insertion and extraction; O(1) for peek.

For the top-k query, the intended complexity is O(n log k), where n
is the number of containers examined.

## 6. Binary Search Tree (BST)

**Used for:** Organizing ships by arrival time.

The tree uses the arrival value and ship ID together as a key.
In-order traversal returns ships in sorted arrival order, while range
queries find ships arriving between two specified times.

**Main operations:** `insert`, `search`, `inorder`, `range`

**Typical time complexity:** O(log n) average for balanced-like operation
patterns; O(n) in the worst case for an ordinary, unbalanced BST.

## 7. Graph

**Used for:** Representing routes between destinations.

Each destination is a vertex, and each route is an undirected edge.
Breadth-first search (BFS) identifies reachable destinations and can
find a shortest path in an unweighted graph.

A visited Set prevents destinations from being processed repeatedly,
including when routes contain cycles.

**Main operations:** `addNode`, `addEdge`, `bfs`, `reachableFrom`

**Time complexity:** O(V + E) for BFS, where V is the number of
vertices and E is the number of edges.

## 8. Trie

**Used for:** Prefix searches over ship IDs and container IDs.

A Trie stores identifiers character by character. It can find IDs
beginning with a prefix without scanning every registered identifier.

The application maintains separate indexes for ships and containers.

**Main operations:** `insert`, `search`, `searchPrefix`, `startsWith`

**Time complexity:** O(p) for exact lookup, where p is the identifier
length; prefix results take O(p + k), where k is the number of matches.

## 9. Set

**Used for:** Tracking unique destination codes and keeping visited
destinations during graph traversal.

A Set stores each value only once. This prevents duplicate destination
codes and helps BFS avoid revisiting destinations.

The custom Set is built on the custom HashMap.

**Main operations:** `add`, `has`, `delete`, `values`

**Typical time complexity:** O(1) average for adding, checking,
and deleting an item.

## Why these structures work together

Each structure has a separate responsibility:

- Stack manages last-in-first-out cargo and history operations.
- Queue preserves the container yard's loading order.
- PriorityQueue selects ships by urgency.
- HashMap provides identifier-based access to records.
- MinHeap supports top-k heaviest-container queries.
- BST supports arrival ordering and range queries.
- Graph represents destination connectivity.
- Trie supports prefix-based identifier search.
- Set tracks unique values and visited destinations.

The Port coordinates these structures, while the Engine manages simulation
time and emits events. The UI reads Engine snapshots and calls its public
methods; it should not implement port rules or manipulate these structures
directly.
