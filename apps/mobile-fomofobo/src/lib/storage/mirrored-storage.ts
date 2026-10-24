export interface PersistentStore {
    getAllKeys: () => Promise<readonly string[]>
    multiGet: (keys: readonly string[]) => Promise<ReadonlyArray<[string, string | null]>>
    setItem: (key: string, value: string) => Promise<void>
    removeItem: (key: string) => Promise<void>
}

/**
 * @description Builds a synchronous `Storage` held in memory, which writes each change through to a persistent store
 * @param store Asynchronous store that keeps the items across launches
 * @remarks Reads see only what `hydrate` loaded, so the app awaits it before the first read
 */
export const createMirroredStorage = (store: PersistentStore) => {
    const items = new Map<string, string>()
    // One write at a time, in call order: a later write never lands before an earlier one.
    let writes = Promise.resolve()

    const persist = (write: () => Promise<void>) => {
        writes = writes.then(write).catch(() => undefined)
    }

    const storage: Storage = {
        get length() {
            return items.size
        },
        key: index => [...items.keys()][index] ?? null,
        getItem: key => items.get(key) ?? null,
        setItem: (key, value) => {
            items.set(key, value)
            persist(() => store.setItem(key, value))
        },
        removeItem: key => {
            items.delete(key)
            persist(() => store.removeItem(key))
        },
        clear: () => {
            for (const key of items.keys()) {
                storage.removeItem(key)
            }
        },
    }

    const hydrate = async () => {
        for (const [key, value] of await store.multiGet(await store.getAllKeys())) {
            if (value !== null) {
                items.set(key, value)
            }
        }
    }

    return { storage, hydrate, settled: () => writes }
}
