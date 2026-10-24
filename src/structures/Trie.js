
export class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEnd = false;
        this.word = null;
        this.words = [];
    }
}

export class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        if (this.search(word)) {
            return;
        }

        let current = this.root;
        current.words.push(word);

        for (const char of word) {
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }

            current = current.children.get(char);
            current.words.push(word);
        }

        current.isEnd = true;
        current.word = word;
    }

    search(word) {
        let current = this.root;

        for (const char of word) {
            if (!current.children.has(char)) {
                return false;
            }

            current = current.children.get(char);
        }

        return current.isEnd;
    }

    searchPrefix(prefix) {
        let current = this.root;

        for (const char of prefix) {
            if (!current.children.has(char)) {
                return [];
            }

            current = current.children.get(char);
        }

        return [...current.words];
    }

    startsWith(prefix) {
        let current = this.root;

        for (const char of prefix) {
            if (!current.children.has(char)) {
                return false;
            }

            current = current.children.get(char);
        }

        return true;
    }
}
