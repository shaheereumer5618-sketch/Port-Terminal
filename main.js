
import { Engine } from "./src/engine/Engine.js";

import { setupRenderer } from "./src/ui/Renderer.js";
import { setupSearchBar } from "./src/ui/SearchBar.js";
import { setupRoutesPanel } from "./src/ui/RoutesPanel.js";

// Simulation timing configuration.
const TICK_MS = 100;

// Create the Engine that manages the entire port.
const engine = new Engine(TICK_MS);

// Add Ship Form
const addShipForm = document.querySelector("#add-ship-form");
const addShipMessage = document.querySelector("#add-ship-message");

addShipForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const shipId = document.querySelector("#ship-id").value.trim();
    const shipName = document.querySelector("#ship-name").value.trim();
    const arrival = Number(document.querySelector("#ship-arrival").value);
    const priority = Number(document.querySelector("#ship-priority").value);
    const capacity = Number(document.querySelector("#ship-capacity").value);

    try {
        // Register the ship in the port
        engine.addShip(shipId, shipName, arrival, priority, capacity);

        // Process the ship's arrival
        const result = engine.shipArrives(shipId);

        // Display the outcome
        addShipMessage.className = "success";

        if (result.overflown) {
            addShipMessage.textContent =
                `Ship ${shipId} registered, but the port is full. It remains at sea.`;
        } else {
            addShipMessage.textContent =
                `Ship ${shipId} (${shipName}) arrived successfully at line ${result.lineId}.`;
        }

        // Clear the form after successful registration
        addShipForm.reset();

    } catch (error) {
        addShipMessage.className = "error";
        addShipMessage.textContent = `Error: ${error.message}`;
    }
});

// Add example data so the dashboard has something to display.
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

    // Register every ship with the Engine.
    for (const [id, name, arrival, priority, capacity] of ships) {
        engine.addShip(id, name, arrival, priority, capacity);
    }

    // Register containers in the yard.
    for (const [id, weight, destination] of containers) {
        engine.addContainer(id, weight, destination);
    }

    // Create connections between destinations.
    engine.addRoute("A", "B");
    engine.addRoute("B", "C");
    engine.addRoute("C", "D");

    // Send each registered ship to the port.
    for (const [id] of ships) {
        engine.shipArrives(id);
    }
}

// Load the sample data before the UI renders.
addDemoData();

// Connect the UI components to the Engine.
const renderer = setupRenderer(engine);

setupSearchBar(engine);
setupRoutesPanel(engine);

// Find the simulation controls in index.html.
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const speedSelect = document.getElementById("speed-select");
const simulationStatus = document.getElementById("simulation-status");

// Start the simulation when Start is clicked.
startButton.addEventListener("click", () => {
    engine.start();

    startButton.disabled = true;
    stopButton.disabled = false;
    simulationStatus.textContent = "Running";
});

// Stop the simulation when Stop is clicked.
stopButton.addEventListener("click", () => {
    engine.stop();

    startButton.disabled = false;
    stopButton.disabled = true;
    simulationStatus.textContent = "Stopped";
});

// Change the simulation speed.
speedSelect.addEventListener("change", () => {
    const speed = Number(speedSelect.value);

    engine.setSpeed(speed);
});

// Reflect the Engine's current running state.
engine.bus.on("engine:tick", () => {
    simulationStatus.textContent =
        engine.running ? "Running" : "Stopped";
});

// Stop the timer and remove renderer listeners when leaving.
window.addEventListener("beforeunload", () => {
    engine.stop();
    renderer.destroy();
});
