
export function setupRoutesPanel(engine) {
    const routesList = document.getElementById("routes-list");
    const routeStart = document.getElementById("route-start");
    const reachableDisplay = document.getElementById(
        "reachable-destinations"
    );
    const uniqueDisplay = document.getElementById(
        "unique-destinations"
    );

    // Stop if the required HTML elements do not exist.
    if (
        !routesList ||
        !routeStart ||
        !reachableDisplay ||
        !uniqueDisplay
    ) {
        return;
    }

    let lastDestinationsKey = "";

    // Display destinations reachable from the selected location.
    function renderReachable() {
        const start = routeStart.value;

        if (start === "") {
            reachableDisplay.textContent =
                "Select a destination to see reachable locations.";
            return;
        }

        const reachable = engine.reachableDestinations(start);

        // Support both our custom Set and the built-in JavaScript Set.
        const values = typeof reachable.values === "function"
            ? Array.from(reachable.values())
            : Array.from(reachable);

        reachableDisplay.textContent =
            `Reachable from ${start}: ${values.join(", ")}`;
    }

    // Refresh the information shown in the routes panel.
    function refresh() {
        const snapshot = engine.getSnapshot();
        const destinations = snapshot.destinations.unique;
        const routes = snapshot.destinations.routes;

        // Display every route as a connection between two destinations.
        routesList.replaceChildren();

        if (routes.length === 0) {
            const message = document.createElement("p");
            message.className = "empty-message";
            message.textContent = "No routes added yet.";
            routesList.appendChild(message);
        } else {
            for (const [from, to] of routes) {
                const route = document.createElement("span");
                route.className = "route-chip";
                route.textContent = `${from} ↔ ${to}`;
                routesList.appendChild(route);
            }
        }

        // Display the list of unique destinations.
        uniqueDisplay.textContent =
            `Unique destinations: ${
                destinations.length > 0
                    ? destinations.join(", ")
                    : "None"
            }`;

        // Rebuild the dropdown only when destinations change.
        const destinationsKey = JSON.stringify(destinations);
        const selectedValue = routeStart.value;

        if (destinationsKey !== lastDestinationsKey) {
            routeStart.replaceChildren();

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select a destination";
            routeStart.appendChild(placeholder);

            for (const destination of destinations) {
                const option = document.createElement("option");
                option.value = destination;
                option.textContent = destination;
                routeStart.appendChild(option);
            }

            lastDestinationsKey = destinationsKey;

            // Keep the previous selection if it still exists.
            if (destinations.includes(selectedValue)) {
                routeStart.value = selectedValue;
            }
        }

        renderReachable();
    }

    // Update reachable destinations when the selection changes.
    routeStart.addEventListener("change", renderReachable);

    // Refresh the panel when port data or simulation state changes.
    engine.bus.on("data:updated", refresh);
    engine.bus.on("engine:tick", refresh);

    // Display the current data immediately.
    refresh();
}
