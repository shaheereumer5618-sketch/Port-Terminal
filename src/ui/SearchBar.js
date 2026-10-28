export function setupSearchBar(engine) {
    const input = document.getElementById("search-input");
    const resultsBox = document.getElementById("search-results");
    const modal = document.getElementById("details-modal");
    const modalBody = document.getElementById("details-body");
    const modalTitle = document.getElementById("details-title");
    const modalClose = document.getElementById("details-close");

    if (!input || !resultsBox) {
        return;
    }

    function formatTime(t) {
        if (t === null || t === undefined) {
            return "—";
        }
        return `${(t / 1000).toFixed(1)}s`;
    }

    function scrollAndHighlight(type, id) {
        const selector =
            type === "Ship" ? "[data-ship-id]" : "[data-container-id]";
        const dataKey =
            type === "Ship" ? "shipId" : "containerId";

        const targets = document.querySelectorAll(selector);

        for (const target of targets) {
            if (target.dataset[dataKey] === id) {
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
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
    }

    function sectionTitle(text) {
        const p = document.createElement("p");
        p.className = "details-section-title";
        p.textContent = text;
        return p;
    }

    function addRow(parent, key, value) {
        const row = document.createElement("div");
        row.className = "details-row";

        const k = document.createElement("span");
        k.className = "details-key";
        k.textContent = key;

        const v = document.createElement("span");
        v.className = "details-value";
        v.textContent = value === null || value === undefined
            ? "—"
            : String(value);

        row.appendChild(k);
        row.appendChild(v);
        parent.appendChild(row);
    }

    function addRowElement(parent, key, valueEl) {
        const row = document.createElement("div");
        row.className = "details-row";

        const k = document.createElement("span");
        k.className = "details-key";
        k.textContent = key;

        row.appendChild(k);
        row.appendChild(valueEl);
        parent.appendChild(row);
    }

    function stateBadge(state) {
        const span = document.createElement("span");
        span.className = `details-value details-badge ${state}`;
        span.textContent = state;
        return span;
    }

    function priorityBadge(details) {
        const span = document.createElement("span");
        span.className = "details-value";
        span.textContent =
            `${details.priorityLabel} (${details.priority})`;
        return span;
    }

    function neighbourBlock(label, neighbour, type) {
        const wrap = document.createElement(neighbour ? "button" : "div");
        wrap.className = neighbour
            ? "details-neighbour"
            : "details-empty-neighbour";

        if (neighbour) {
            wrap.type = "button";
        }

        const lbl = document.createElement("span");
        lbl.className = "details-neighbour-label";
        lbl.textContent = label;
        wrap.appendChild(lbl);

        if (neighbour) {
            const idSpan = document.createElement("span");
            idSpan.className = "details-neighbour-id";
            idSpan.textContent = neighbour.id;
            wrap.appendChild(idSpan);

            const meta = document.createElement("span");
            meta.className = "details-neighbour-meta";

            if (type === "Ship") {
                meta.textContent =
                    `${neighbour.relation} · ${neighbour.state}`;
            } else {
                meta.textContent = neighbour.relation;
            }

            wrap.appendChild(meta);

            wrap.addEventListener("click", () => {
                openDetails(type, neighbour.id);
                scrollAndHighlight(type, neighbour.id);
            });
        } else {
            const meta = document.createElement("span");
            meta.className = "details-neighbour-meta";
            meta.textContent = "(none)";
            wrap.appendChild(meta);
        }

        return wrap;
    }

    function navSection(title, previous, next, type) {
        const nav = document.createElement("div");
        nav.className = "details-section";
        nav.appendChild(sectionTitle(title));

        const grid = document.createElement("div");
        grid.className = "details-nav-grid";
        grid.appendChild(neighbourBlock("← Previous", previous, type));
        grid.appendChild(neighbourBlock("Next →", next, type));
        nav.appendChild(grid);

        return nav;
    }

    function openDetails(type, id) {
        if (!modal || !modalBody || !modalTitle) return;

        const details = type === "Ship"
            ? engine.shipDetails(id)
            : engine.containerDetails(id);

        if (!details) return;

        modalTitle.textContent = `${details.type}: ${details.id}`;
        modalBody.replaceChildren();

        const info = document.createElement("div");
        info.className = "details-section";
        info.appendChild(sectionTitle("Information"));

        if (type === "Ship") {
            addRow(info, "Name", details.name);
            addRowElement(info, "Priority", priorityBadge(details));
            addRowElement(info, "State", stateBadge(details.state));
            addRow(info, "Arrival", formatTime(details.arrivalTime));
            addRow(info, "Departure", formatTime(details.departureTime));

            if (
                details.state === "loading" ||
                details.state === "unloading"
            ) {
                addRow(
                    info,
                    "Current operation",
                    `${details.state} ${details.activeContainerId ?? ""}`
                );
                addRow(
                    info,
                    "Progress",
                    `${Math.round((details.progress ?? 0) * 100)}%`
                );
            }

            addRow(
                info,
                "Capacity",
                `${details.used} / ${details.capacity}`
            );
            addRow(
                info,
                "Line",
                details.lineId ? `Line ${details.lineId}` : "—"
            );
            addRow(
                info,
                "Containers",
                details.containers.length > 0
                    ? details.containers.join(", ")
                    : "—"
            );
        } else {
            addRow(info, "Weight", details.weight);
            addRow(info, "Destination", details.dest);
            addRowElement(info, "Status", stateBadge(details.status));
            addRow(info, "Location", details.location);
            addRow(info, "On ship", details.shipId);
        }

        modalBody.appendChild(info);

        modalBody.appendChild(
            navSection(
                "Navigation",
                details.previous,
                details.next,
                type
            )
        );

        if (
            type === "Container" &&
            details.location !== "Container Yard" &&
            (details.lastYardPrevious || details.lastYardNext)
        ) {
            modalBody.appendChild(
                navSection(
                    "Yard neighbours (before loading)",
                    details.lastYardPrevious,
                    details.lastYardNext,
                    type
                )
            );
        }

        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
    }

    input.addEventListener("input", () => {
        const prefix = input.value.trim();

        resultsBox.replaceChildren();

        if (prefix === "") {
            return;
        }

        const shipIds = engine.searchShipsByPrefix(prefix);
        const containerIds = engine.searchContainersByPrefix(prefix);

        const results = [
            ...shipIds.map(id => ({ type: "Ship", id })),
            ...containerIds.map(id => ({ type: "Container", id }))
        ];

        if (results.length === 0) {
            const message = document.createElement("p");
            message.className = "search-result";
            message.textContent = "No matches found.";
            resultsBox.appendChild(message);
            return;
        }

        for (const result of results) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "search-result";
            button.textContent = `${result.type}: ${result.id}`;

            button.addEventListener("click", () => {
                input.value = result.id;
                scrollAndHighlight(result.type, result.id);
                resultsBox.replaceChildren();
                openDetails(result.type, result.id);
            });

            resultsBox.appendChild(button);
        }
    });

    input.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            resultsBox.replaceChildren();
        }
    });

    if (modalClose) {
        modalClose.addEventListener("click", closeModal);
    }

    if (modal) {
        modal.addEventListener("click", event => {
            if (
                event.target === modal ||
                event.target.classList.contains("details-modal-backdrop")
            ) {
                closeModal();
            }
        });
    }

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            modal &&
            !modal.classList.contains("hidden")
        ) {
            closeModal();
        }
    });
}