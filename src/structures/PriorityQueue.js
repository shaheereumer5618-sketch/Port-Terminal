
export class PriorityQueue {
    constructor() {
        this.items = [];
    }

    _comesBefore(a, b) {
        if (a.priority !== b.priority) {
            return a.priority < b.priority;
        }

        return a.seq < b.seq;
    }

    push(priority, seq, value) {
        const entry = { priority, seq, value };

        this.items.push(entry);
        this._bubbleUp(this.items.length - 1);
    }

    pop() {
        if (this.isEmpty()) {
            return null;
        }

        const first = this.items[0];
        const last = this.items.pop();

        if (!this.isEmpty()) {
            this.items[0] = last;
            this._bubbleDown(0);
        }

        return first;
    }

    peek() {
        if (this.isEmpty()) {
            return null;
        }

        return this.items[0];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);

            if (
                !this._comesBefore(
                    this.items[index],
                    this.items[parentIndex]
                )
            ) {
                break;
            }

            const temp = this.items[index];
            this.items[index] = this.items[parentIndex];
            this.items[parentIndex] = temp;

            index = parentIndex;
        }
    }

    _bubbleDown(index) {
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let bestIndex = index;

            if (
                leftIndex < this.items.length &&
                this._comesBefore(
                    this.items[leftIndex],
                    this.items[bestIndex]
                )
            ) {
                bestIndex = leftIndex;
            }

            if (
                rightIndex < this.items.length &&
                this._comesBefore(
                    this.items[rightIndex],
                    this.items[bestIndex]
                )
            ) {
                bestIndex = rightIndex;
            }

            if (bestIndex === index) {
                break;
            }

            const temp = this.items[index];
            this.items[index] = this.items[bestIndex];
            this.items[bestIndex] = temp;

            index = bestIndex;
        }
    }
}
