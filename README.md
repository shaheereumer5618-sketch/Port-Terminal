
# Port Terminal Manager

A JavaScript port simulation that manages ship arrivals, docking lines,
priority queues, container loading and unloading, and destination routes.

## Features

- Four docking lines, each with a capacity of eight ships.
- Priority-based ship ordering and at-sea overflow handling.
- Container yard with FIFO loading order.
- Loading and unloading operations with simulated progress.
- Ship departure and promotion of waiting ships.
- Undo support for the most recent unload.
- Search by ship ID or container ID prefix.
- Destination graph and reachability queries.
- Arrival ordering, arrival-range queries, and heaviest-container queries.
- Animated browser dashboard with speed controls.

## Requirements

- Node.js with ES module support.
- A local HTTP server to serve the browser application.

## Run the application

From the project root, start a local server:

    npx http-server .

Open the local URL printed in the terminal, usually:

    http://localhost:8080

Keep the server running while using the application.

## Run the tests

From the project root:

    node --test

## Project structure

- `src/structures/` — Stack, Queue, PriorityQueue, HashMap,
  MinHeap, BST, Graph, Trie, and Set.
- `src/domain/` — Container, Ship, and Line.
- `src/engine/` — Port, Engine, and EventBus.
- `src/ui/` — Renderer, ShipCard, LineColumn, SearchBar,
  and RoutesPanel.
- `styles/` — Dashboard styling.
- `tests/` — Automated tests.
- `index.html` and `main.js` — Browser entry point and application setup.

## Engine and UI boundary

The Engine owns the Port and implements the simulation rules. It provides
action methods, query methods, snapshots, and events.

The UI reads snapshots, calls Engine methods in response to user actions,
and listens for events to update the display. It does not decide ship
priority, line assignment, or simulation progress.

## Data structures

The custom data structures and their roles are documented in
`docs/data-structures.md`.

## Demo data

The browser entry point currently registers sample ships, containers,
and routes so the dashboard has data to display when it opens.
