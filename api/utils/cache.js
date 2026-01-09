class Cache {
    constructor() {
        this.store = new Map();
        setInterval(() => this.cleanup(), 60 * 1000);
    }

    get(key) {
        const item = this.store.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }

        return item.value;
    }

    set(key, value, ttlSeconds = 300) {
        this.store.set(key, {
            value,
            expiry: Date.now() + (ttlSeconds * 1000)
        });
    }

    delete(key) {
        this.store.delete(key);
    }

    flush() {
        this.store.clear();
    }

    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.store.entries()) {
            if (now > item.expiry) {
                this.store.delete(key);
            }
        }
    }
}

export default new Cache();
