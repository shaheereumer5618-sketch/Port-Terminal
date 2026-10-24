
const PRIORITY_LABELS = {
    "-1": "Emergency",
    0: "Critical",
    1: "High",
    2: "Normal",
    3: "Low",
    4: "Very low",
    5: "Bulk"
};

const PRIORITY_CLASSES = {
    "-1": "priority-emergency",
    0: "priority-critical",
    1: "priority-high"
};

export function createShipCard(ship, engine) {
    const card = document.createElement("article");
    card.className = "ship-card";

    const isWaiting = ship.state === "waiting";
    const isOperating =
        ship.state === "loading" || ship.state === "unloading";

    if (!isWaiting) {
        card.classList.add("active");
    }

    // Ship ID and name.
    const heading = document.createElement("h4");
    heading.textContent = `${ship.id} — ${ship.name}`;
    card.appendChild(heading);

    // Priority badge.
    const priority = document.createElement("span");
    priority.className = "priority-label";

    const priorityClass = PRIORITY_CLASSES[ship.priority];

    if (priorityClass) {
        priority.classList.add(priorityClass);
    }

    priority.textContent =
        ship.priorityLabel ??
        PRIORITY_LABELS[ship.priority] ??
        "Unknown";

    card.appendChild(priority);

    // Cargo capacity.
    const capacity = document.createElement("p");
    capacity.className = "ship-meta";
    capacity.textContent = `Capacity: ${ship.used} / ${ship.capacity}`;
    card.appendChild(capacity);

    // Ship state.
    const state = document.createElement("p");
    state.className = "ship-meta";
    state.textContent = `State: ${ship.state}`;
    card.appendChild(state);

    // Show progress while an operation is running.
    if (isOperating) {
        const progress = Math.max(
            0,
            Math.min(1, Number(ship.progress) || 0)
        );

        const track = document.createElement("div");
        track.className = "ship-progress-track";

        const fill = document.createElement("div");
        fill.className = "ship-progress-fill";
        fill.style.width = `${progress * 100}%`;

        track.appendChild(fill);
        card.appendChild(track);

        const progressLabel = document.createElement("p");
        progressLabel.className = "ship-progress-label";
        progressLabel.textContent =
            `${Math.round(progress * 100)}% complete`;
        card.appendChild(progressLabel);

        const container = document.createElement("p");
        container.textContent =
            `Container: ${ship.activeContainerId ?? "—"}`;
        card.appendChild(container);
    }

    // Operation feedback for this card.
    const message = document.createElement("p");
    message.className = "action-message";
    message.setAttribute("aria-live", "polite");

    // Only the active ship can perform operations.
    if (!isWaiting) {
        const actions = document.createElement("div");
        actions.className = "ship-actions";

        function addActionButton(label, disabled, action) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "ship-action-button";
            button.textContent = label;
            button.disabled = disabled;

            button.addEventListener("click", () => {
                try {
                    action();
                } catch (error) {
                    message.textContent =
                        error instanceof Error
                            ? error.message
                            : "The operation could not be started.";
                }
            });

            actions.appendChild(button);
        }

        // Load the first container waiting in the yard.
        addActionButton(
            "Load next",
            isOperating || ship.used >= ship.capacity,
            () => {
                const yard = engine.getSnapshot().yard;
                const nextContainer = yard[0];

                if (!nextContainer) {
                    throw new Error("The container yard is empty.");
                }

                engine.startLoading(ship.id, nextContainer.id);
            }
        );

        // Unload the top container from the ship's stack.
        addActionButton(
            "Unload top",
            isOperating || ship.used === 0,
            () => {
                engine.startUnloading(ship.id);
            }
        );

        // Ask the Engine to depart the ship.
        addActionButton(
            "Depart",
            isOperating || ship.used !== 0,
            () => {
                engine.depart(ship.id);
            }
        );

        card.appendChild(actions);
        card.appendChild(message);
    }

    return card;
}
