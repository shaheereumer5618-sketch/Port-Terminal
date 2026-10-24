
import { createShipCard } from "./ShipCard.js";

export function renderLineColumn(line, engine) {
    const shipList = document.getElementById(
        `line-${line.id}-ships`
    );

    if (!shipList) {
        return;
    }

    const fragment = document.createDocumentFragment();

    if (!line.ships || line.ships.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No ships in this line.";
        fragment.appendChild(message);
    } else {
        for (const ship of line.ships) {
            const card = createShipCard(ship, engine);

            card.dataset.shipId = ship.id;
            fragment.appendChild(card);
        }
    }

    shipList.replaceChildren(fragment);
}
