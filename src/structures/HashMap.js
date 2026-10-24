
export class HashMap {
    constructor(capacity = 16) {
        this.capacity = capacity;
        this.buckets = Array.from(
            { length: capacity },
            () => []
        );
        this.count = 0;
    }

    hash(key) {
        const text = String(key);
        let hashValue = 0;

        for (let i = 0; i < text.length; i++) {
            hashValue =
                (hashValue * 31 + text.charCodeAt(i))
                % this.capacity;
        }

        return hashValue;
    }

    set(key, value) {
        const index = this.hash(key);
        const bucket = this.buckets[index];

        for (const entry of bucket) {
            if (entry[0] === key) {
                entry[1] = value;
                return;
            }
        }

        bucket.push([key, value]);
        this.count++;

        if (this.count / this.capacity >= 0.75) {
            this._resize();
        }
    }

    get(key) {
        const bucket = this.buckets[this.hash(key)];

        for (const [storedKey, value] of bucket) {
            if (storedKey === key) {
                return value;
            }
        }

        return undefined;
    }

    has(key) {
        const bucket = this.buckets[this.hash(key)];

        for (const [storedKey] of bucket) {
            if (storedKey === key) {
                return true;
            }
        }

        return false;
    }

    delete(key) {
        const bucket = this.buckets[this.hash(key)];

        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === key) {
                bucket.splice(i, 1);
                this.count--;
                return true;
            }
        }

        return false;
    }

    size() {
        return this.count;
    }

    keys() {
        const result = [];

        for (const bucket of this.buckets) {
            for (const [key] of bucket) {
                result.push(key);
            }
        }

        return result;
    }

    values() {
        const result = [];

        for (const bucket of this.buckets) {
            for (const [, value] of bucket) {
                result.push(value);
            }
        }

        return result;
    }

    entries() {
        const result = [];

        for (const bucket of this.buckets) {
            for (const entry of bucket) {
                result.push([...entry]);
            }
        }

        return result;
    }

    _resize() {
        const oldBuckets = this.buckets;

        this.capacity *= 2;
        this.buckets = Array.from(
            { length: this.capacity },
            () => []
        );

        for (const bucket of oldBuckets) {
            for (const [key, value] of bucket) {
                const index = this.hash(key);
                this.buckets[index].push([key, value]);
            }
        }
    }
}
