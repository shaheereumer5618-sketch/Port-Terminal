
import { renderLineColumn } from "./LineColumn.js";

const PRIORITY_LABELS = {
    "-1": "Emergency",
    0: "Critical",
    1: "High",
    2: "Normal",
    3: "Low",
    4: "Very low",
    5: "Bulk"
};

export function setupRenderer(engine) {
    const atSeaList = document.getElementById("at-sea-list");
    const yardList = document.getElementById("yard-list");

    // Keep track of each ship card by its ID.
    const shipElements = new Map();

    // Render ships waiting outside the full port.
    function renderAtSea(ships) {
        if (!atSeaList) return;

        const fragment = document.createDocumentFragment();

        if (ships.length === 0) {
            const message = document.createElement("p");
            message.className = "empty-message";
            message.textContent = "No ships waiting at sea.";
            fragment.appendChild(message);
        } else {
            for (const ship of ships) {
                const chip = document.createElement("div");
                chip.className = "ship-chip";
                chip.dataset.shipId = ship.id;

                const priority =
                    PRIORITY_LABELS[ship.priority] ?? "Unknown";

                chip.textContent =
                    `${ship.id} — ${ship.name} (${priority})`;

                fragment.appendChild(chip);
            }
        }

        atSeaList.replaceChildren(fragment);
    }

    // Render containers waiting in the yard.
    function renderYard(containers) {
        if (!yardList) return;

        const fragment = document.createDocumentFragment();

        if (containers.length === 0) {
            const message = document.createElement("p");
            message.className = "empty-message";
            message.textContent = "The yard is empty.";
            fragment.appendChild(message);
        } else {
            for (const container of containers) {
                const chip = document.createElement("div");

                chip.className = "container-chip";
                chip.dataset.containerId = container.id;

                chip.textContent =
                    `${container.id} — Weight: ${container.weight}`;

                fragment.appendChild(chip);
            }
        }

        yardList.replaceChildren(fragment);
    }

    // Rebuild the ID-to-element lookup after structural changes.
    function indexShipElements() {
        shipElements.clear();

        const cards = document.querySelectorAll("[data-ship-id]");

        for (const card of cards) {
            shipElements.set(card.dataset.shipId, card);
        }
    }

    // Render the latest complete port snapshot.
    function render() {
        const snapshot = engine.getSnapshot();

        for (const line of snapshot.lines) {
            renderLineColumn(line, engine);
        }

        renderAtSea(snapshot.atSea);
        renderYard(snapshot.yard);

        indexShipElements();
    }

    // Update one ship's progress without rebuilding all its cards.
    function updateProgress(event) {
        const card = shipElements.get(event.shipId);

        if (!card) return;

        const fill = card.querySelector(".ship-progress-fill");
        const label = card.querySelector(".ship-progress-label");

        const progress = Math.max(
            0,
            Math.min(1, Number(event.progress) || 0)
        );

        const percentage = Math.round(progress * 100);

        if (fill) {
            fill.style.width = `${percentage}%`;
        }

        if (label) {
            label.textContent = `${percentage}% complete`;
        }
    }

    // Events that can change which items are displayed.
    const refreshEvents = [
        "data:updated",
        "ship:arrived",
        "ship:overflown",
        "ship:docked",
        "ship:loadingStarted",
        "ship:unloadingStarted",
        "ship:loadingFinished",
        "ship:unloadingFinished",
        "ship:departed"
    ];

    for (const eventName of refreshEvents) {
        engine.bus.on(eventName, render);
    }

    // Progress events update only the relevant card.
    engine.bus.on("ship:progress", updateProgress);

    // Show the initial port state immediately.
    render();

    // Return controls for refreshing or cleaning up listeners.
    return {
        render,

        destroy() {
            for (const eventName of refreshEvents) {
                engine.bus.off(eventName, render);
            }

            engine.bus.off("ship:progress", updateProgress);
        }
    };
}
