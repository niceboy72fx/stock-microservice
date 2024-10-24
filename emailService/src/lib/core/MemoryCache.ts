import {deepFreeze} from "../basics";

export interface MemoryCacheOptions  {
    name?: string,
    freezeValue?: boolean,
    debug?: boolean,
    cleanInterval?: number
}

class CacheValue {
    timeout: number;
    value: any;

    constructor(value: any, ttl: number) {
        this.value = value;
        this.timeout = Date.now() + ttl  * 1000;
    }

    getValue() {
        if (this.isTimeout()) {
            return undefined;
        }

        return this.value;
    }

    getTtl(): number {
        return Math.max(0, this.timeout - Date.now());
    }

    isTimeout() {
        return Date.now() > this.timeout;
    }
}

export default class MemoryCache {
    private readonly name: string;
    private readonly debug: boolean = false;
    private readonly freezeValue: boolean = false;
    private readonly cleanInterval: number = 60000;
    private container: { [key: string] : CacheValue } = {};
    private readonly tag: string;

    constructor(options: MemoryCacheOptions = {}) {
        this.name = options.name || 'default';
        this.debug = options.debug || false
        this.freezeValue = options.freezeValue || false;
        this.cleanInterval = 60000;
        this.tag = '[' + this.name + ']';

        if (options.cleanInterval) {
            this.cleanInterval = options.cleanInterval * 1000;
        }

        setTimeout(() => {
            this.processCleaner();
        },  this.cleanInterval);
    }

    private processCleaner() {
        if (this.debug) {
            console.log(this.tag, 'Cache cleaner process running');
        }

        const deletedKeys = [];
        for (const k in this.container) {
            const v = this.container[k];
            if (v.isTimeout()) {
                deletedKeys.push(k);
            }
        }
        if (deletedKeys.length > 0) {
            this.del(deletedKeys);
        }

        setTimeout(() => {
            this.processCleaner();
        },  this.cleanInterval);
    }

    flushAll() {
        this.container = {};
    }

    get<T>(key: string) {
        const v = this.container[key];
        if (!v) {
            return undefined;
        }

        if (v.getTtl() <= 0) {
            this.del(key);
            return undefined;
        }

        return v.getValue();
    }

    mGet(keys: string[]): Array<any> {
        const values = keys.map(key => {
            return this.get<any>(key);
        });

        return values;
    }

    del(keys: string | string[]): number {
        if (this.debug) {
            console.log(this.tag, 'CACHE DEL ', keys)
        }

        let deletedCount = 0;

        if (Array.isArray(keys)) {
            keys.forEach(key => {
                if (this.container[key]) {
                    delete this.container[key];
                    deletedCount++;
                }

            })
        } else {
            if (this.container[keys]) {
                delete this.container[keys];
                deletedCount++;
            }

        }

        return deletedCount;
    }

    set(key: string, value, ttl = 86400) {
        if (this.debug) {
            console.log(this.tag, 'CACHE SET', key)
        }

        if (this.freezeValue) {
            deepFreeze(value)
        }

        this.container[key] = new CacheValue(value, ttl);
    }

    ttl(key: string): number {
        const value = this.container[key];
        if (!value) {
            return -1;
        }

        return value.getTtl() / 1000;
    }
}