
export class Queue {
    constructor() {
        this.items = [];
        this.front = 0;
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        if (this.isEmpty()) {
            return null;
        }

        const item = this.items[this.front];
        this.items[this.front] = undefined;
        this.front++;

        if (this.front === this.items.length) {
            this.items = [];
            this.front = 0;
        } else if (
            this.front >= 50 &&
            this.front * 2 >= this.items.length
        ) {
            this.items = this.items.slice(this.front);
            this.front = 0;
        }

        return item;
    }

    peek() {
        if (this.isEmpty()) {
            return null;
        }

        return this.items[this.front];
    }

    isEmpty() {
        return this.front >= this.items.length;
    }

    size() {
        return this.items.length - this.front;
    }

    toArray() {
        return this.items.slice(this.front);
    }
}
