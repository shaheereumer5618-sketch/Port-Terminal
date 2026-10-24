
export class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);

        if (!callbacks) {
            return;
        }

        const remaining = callbacks.filter(
            listener => listener !== callback
        );

        if (remaining.length === 0) {
            this.listeners.delete(event);
        } else {
            this.listeners.set(event, remaining);
        }
    }

    emit(event, payload) {
        const callbacks = this.listeners.get(event);

        if (!callbacks) {
            return;
        }

        for (const callback of [...callbacks]) {
            callback(payload);
        }
    }
}
