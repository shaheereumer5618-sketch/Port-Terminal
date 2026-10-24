
export class BSTNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

export class BST {
    constructor() {
        this.root = null;
    }

    _compareKeys(a, b) {
        if (a[0] !== b[0]) {
            return a[0] < b[0] ? -1 : 1;
        }

        if (a[1] === b[1]) {
            return 0;
        }

        return a[1] < b[1] ? -1 : 1;
    }

    insert(key, value) {
        const newNode = new BSTNode([...key], value);

        if (this.root === null) {
            this.root = newNode;
            return;
        }

        let current = this.root;

        while (true) {
            const comparison = this._compareKeys(
                key,
                current.key
            );

            if (comparison === 0) {
                current.value = value;
                return;
            }

            if (comparison < 0) {
                if (current.left === null) {
                    current.left = newNode;
                    return;
                }

                current = current.left;
            } else {
                if (current.right === null) {
                    current.right = newNode;
                    return;
                }

                current = current.right;
            }
        }
    }

    search(key) {
        let current = this.root;

        while (current !== null) {
            const comparison = this._compareKeys(
                key,
                current.key
            );

            if (comparison === 0) {
                return current.value;
            }

            if (comparison < 0) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return null;
    }

    inorder() {
        const result = [];

        const traverse = (node) => {
            if (node === null) {
                return;
            }

            traverse(node.left);

            result.push({
                key: [...node.key],
                value: node.value
            });

            traverse(node.right);
        };

        traverse(this.root);
        return result;
    }

    range(startKey, endKey) {
        const result = [];

        if (this._compareKeys(startKey, endKey) > 0) {
            return result;
        }

        const traverse = (node) => {
            if (node === null) {
                return;
            }

            const startComparison = this._compareKeys(
                node.key,
                startKey
            );

            const endComparison = this._compareKeys(
                node.key,
                endKey
            );

            if (startComparison > 0) {
                traverse(node.left);
            }

            if (
                startComparison >= 0 &&
                endComparison <= 0
            ) {
                result.push({
                    key: [...node.key],
                    value: node.value
                });
            }

            if (endComparison < 0) {
                traverse(node.right);
            }
        };

        traverse(this.root);
        return result;
    }

    min() {
        if (this.root === null) {
            return null;
        }

        let current = this.root;

        while (current.left !== null) {
            current = current.left;
        }

        return {
            key: [...current.key],
            value: current.value
        };
    }

    max() {
        if (this.root === null) {
            return null;
        }

        let current = this.root;

        while (current.right !== null) {
            current = current.right;
        }

        return {
            key: [...current.key],
            value: current.value
        };
    }
}
