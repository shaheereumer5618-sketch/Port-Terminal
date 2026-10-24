
export class MinHeap {
    constructor(compare = (a, b) => a - b) {
        this.heap = [];
        this.compare = compare;
    }

    insert(value) {
        this.heap.push(value);
        this._bubbleUp(this.heap.length - 1);
    }

    peek() {
        if (this.isEmpty()) {
            return null;
        }

        return this.heap[0];
    }

    extractMin() {
        if (this.isEmpty()) {
            return null;
        }

        const minimum = this.heap[0];
        const last = this.heap.pop();

        if (!this.isEmpty()) {
            this.heap[0] = last;
            this._bubbleDown(0);
        }

        return minimum;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    size() {
        return this.heap.length;
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);

            if (
                this.compare(
                    this.heap[index],
                    this.heap[parentIndex]
                ) >= 0
            ) {
                break;
            }

            const temp = this.heap[index];
            this.heap[index] = this.heap[parentIndex];
            this.heap[parentIndex] = temp;

            index = parentIndex;
        }
    }

    _bubbleDown(index) {
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;

            if (
                leftIndex < this.heap.length &&
                this.compare(
                    this.heap[leftIndex],
                    this.heap[smallest]
                ) < 0
            ) {
                smallest = leftIndex;
            }

            if (
                rightIndex < this.heap.length &&
                this.compare(
                    this.heap[rightIndex],
                    this.heap[smallest]
                ) < 0
            ) {
                smallest = rightIndex;
            }

            if (smallest === index) {
                break;
            }

            const temp = this.heap[index];
            this.heap[index] = this.heap[smallest];
            this.heap[smallest] = temp;

            index = smallest;
        }
    }
}
