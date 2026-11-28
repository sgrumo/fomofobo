import "server-only"

interface MemoryCacheEntry<TValue> {
    expiresAt: number
    value: Promise<TValue>
}

const memoryCaches = new Set<{ clear: () => void }>()

/**
 * @remarks Lives in the memory of one server instance: a write on another instance reaches it only when its entries expire
 */
export class MemoryCache<TValue> {
    private readonly entries = new Map<string, MemoryCacheEntry<TValue>>()
    private readonly ttlMs: number
    private readonly maxEntries: number
    public constructor(ttlMs: number, maxEntries: number) {
        this.ttlMs = ttlMs
        this.maxEntries = maxEntries
        memoryCaches.add(this)
    }

    /**
     * @description Returns the value of a key while it is fresh, else loads it once for every caller that asks meanwhile
     * @param key Key of the value
     * @param nowMs Wall clock in ms, which sets the freshness
     * @param load Load of the value on a miss
     */
    public getOrLoad(
        key: string,
        nowMs: number,
        load: () => Promise<TValue>,
    ): Promise<TValue> {
        const cached = this.entries.get(key)
        if (cached !== undefined && cached.expiresAt > nowMs) {
            return cached.value
        }
        // A Map iterates in insertion order, so its first key is the oldest entry
        const oldest = this.entries.keys().next()
        if (this.entries.size >= this.maxEntries && oldest.done !== true) {
            this.entries.delete(oldest.value)
        }
        const entry = { expiresAt: nowMs + this.ttlMs, value: load() }
        this.entries.set(key, entry)
        entry.value.catch(() => {
            // A failed load leaves no entry, so the next caller tries again
            if (this.entries.get(key) === entry) {
                this.entries.delete(key)
            }
        })
        return entry.value
    }

    /**
     * @description Deletes every entry
     */
    public clear(): void {
        this.entries.clear()
    }
}

/**
 * @description Deletes every entry of every memory cache of the instance
 */
export const clearMemoryCaches = (): void => {
    for (const cache of memoryCaches) {
        cache.clear()
    }
}
