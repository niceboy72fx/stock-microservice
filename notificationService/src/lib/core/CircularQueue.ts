export default class CircularQueue<T> {
    #entries: Array<T>
    #counter = - 1;
    constructor(entries: Array<T>) {
        this.#entries = entries;
    }

    length(): number {
        return this.#entries.length;
    }

    nextValue():T {
        this.#counter++;
        if (this.#entries[this.#counter]) {
            return this.#entries[this.#counter];
        }

        this.#counter = 0;
        return this.#entries[0];
    }

    push(value: T) {
        this.#entries.push(value)
    }

    pushMany(values: T[]) {
        for (const v of values) {
            this.#entries.push(v)
        }
    }

    pop(): T {
        return this.#entries.pop();
    }
}