import { Engine } from "./src/engine/Engine.js";

import { setupRenderer } from "./src/ui/Renderer.js";
import { setupSearchBar } from "./src/ui/SearchBar.js";
import { setupRoutesPanel } from "./src/ui/RoutesPanel.js";
import { setupScrollFx } from "./src/ui/scrollFx.js";

// Simulation timing configuration.
const TICK_MS = 100;

// Create the Engine that manages the entire port.
const engine = new Engine(TICK_MS);

// ---------------------------------------------------------------
// Add Ship Form
// ---------------------------------------------------------------
const addShipForm = document.querySelector("#add-ship-form");
const addShipMessage = document.querySelector("#add-ship-message");

addShipForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const shipId = document.querySelector("#ship-id").value.trim();
    const shipName = document.querySelector("#ship-name").value.trim();
    const arrival = Number(document.querySelector("#ship-arrival").value);
    const priority = Number(document.querySelector("#ship-priority").value);
    const capacity = Number(document.querySelector("#ship-capacity").value);
    const lineId = Number(document.querySelector("#ship-line").value);

    try {
        engine.addShip(shipId, shipName, arrival, priority, capacity);
        const result = engine.shipArrives(shipId, lineId);

        addShipMessage.className = "success";

        if (result.overflown) {
            addShipMessage.textContent =
                `Ship ${shipId} registered, but the port is full. It remains at sea.`;
        } else {
            addShipMessage.textContent =
                `Ship ${shipId} (${shipName}) arrived successfully at line ${result.lineId}.`;
        }

        addShipForm.reset();
    } catch (error) {
        addShipMessage.className = "error";
        addShipMessage.textContent = `Error: ${error.message}`;
    }
});

// ---------------------------------------------------------------
// Add Container Form
// ---------------------------------------------------------------
const addContainerForm = document.querySelector("#add-container-form");
const addContainerMessage = document.querySelector("#add-container-message");

addContainerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const containerId = document.querySelector("#container-id").value.trim();
    const weight = Number(document.querySelector("#container-weight").value);
    const dest = document.querySelector("#container-dest").value.trim();

    try {
        engine.addContainer(containerId, weight, dest);

        addContainerMessage.className = "success";
        addContainerMessage.textContent =
            `Container ${containerId} added to yard (weight ${weight}, dest ${dest}).`;

        addContainerForm.reset();
    } catch (error) {
        addContainerMessage.className = "error";
        addContainerMessage.textContent = `Error: ${error.message}`;
    }
});

// ---------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------
function addDemoData() {
    const ships = [
        ["S1", "Neptune", 10, 2, 10],
        ["S2", "Mercury", 20, -1, 10],
        ["S3", "Atlas", 30, 1, 10],
        ["S4", "Orion", 40, 3, 10],
        ["S5", "Voyager", 50, 0, 10],
        ["S6", "Horizon", 60, 2, 10],
        ["S7", "Poseidon", 70, 4, 10]
    ];

    const containers = [
        ["C1", 20, "A"],
        ["C2", 15, "B"],
        ["C3", 40, "C"],
        ["C10", 8, "A"],
        ["C11", 6, "B"],
        ["C12", 32, "D"]
    ];

    for (const [id, name, arrival, priority, capacity] of ships) {
        engine.addShip(id, name, arrival, priority, capacity);
    }

    for (const [id, weight, destination] of containers) {
        engine.addContainer(id, weight, destination);
    }

    engine.addRoute("A", "B");
    engine.addRoute("B", "C");
    engine.addRoute("C", "D");

    for (const [id] of ships) {
        engine.shipArrives(id);
    }
}

addDemoData();

// ---------------------------------------------------------------
// UI components
// ---------------------------------------------------------------
const renderer = setupRenderer(engine);
setupSearchBar(engine);
setupRoutesPanel(engine);
setupScrollFx();

// ---------------------------------------------------------------
// Simulation controls
// ---------------------------------------------------------------
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const speedSelect = document.getElementById("speed-select");
const simulationStatus = document.getElementById("simulation-status");

startButton.addEventListener("click", () => {
    engine.start();

    startButton.disabled = true;
    stopButton.disabled = false;
    simulationStatus.textContent = "Running";
});

stopButton.addEventListener("click", () => {
    engine.stop();

    startButton.disabled = false;
    stopButton.disabled = true;
    simulationStatus.textContent = "Stopped";
});

speedSelect.addEventListener("change", () => {
    const speed = Number(speedSelect.value);
    engine.setSpeed(speed);
});

engine.bus.on("engine:tick", () => {
    simulationStatus.textContent =
        engine.running ? "Running" : "Stopped";
});

window.addEventListener("beforeunload", () => {
    engine.stop();
    renderer.destroy();
});