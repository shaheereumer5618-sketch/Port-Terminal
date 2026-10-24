
export function setupSearchBar(engine) {
    const input = document.getElementById("search-input");
    const resultsBox = document.getElementById("search-results");

    // Make sure the required HTML elements exist.
    if (!input || !resultsBox) {
        return;
    }

    // Search whenever the user types.
    input.addEventListener("input", () => {
        const prefix = input.value.trim();

        // Clear previous results.
        resultsBox.replaceChildren();

        // Do not search for an empty input.
        if (prefix === "") {
            return;
        }

        // Ask the Engine to search its Tries.
        const shipIds = engine.searchShipsByPrefix(prefix);
        const containerIds =
            engine.searchContainersByPrefix(prefix);

        // Combine both kinds of results.
        const results = [
            ...shipIds.map(id => ({ type: "Ship", id })),
            ...containerIds.map(id => ({ type: "Container", id }))
        ];

        // Display a message when nothing matches.
        if (results.length === 0) {
            const message = document.createElement("p");
            message.className = "search-result";
            message.textContent = "No matches found.";
            resultsBox.appendChild(message);
            return;
        }

        // Create one result button for each matching ID.
        for (const result of results) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "search-result";
            button.textContent = `${result.type}: ${result.id}`;

            button.addEventListener("click", () => {
                const selector =
                    result.type === "Ship"
                        ? "[data-ship-id]"
                        : "[data-container-id]";

                const dataKey =
                    result.type === "Ship"
                        ? "shipId"
                        : "containerId";

                const targets = document.querySelectorAll(selector);

                for (const target of targets) {
                    if (target.dataset[dataKey] === result.id) {
                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                        target.classList.add("search-highlight");

                        window.setTimeout(() => {
                            target.classList.remove("search-highlight");
                        }, 1800);

                        break;
                    }
                }

                input.value = result.id;
                resultsBox.replaceChildren();
            });

            resultsBox.appendChild(button);
        }
    });
}
