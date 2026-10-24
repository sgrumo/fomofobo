import { createWebStorage, storagePrefix } from "frontend-shared/storage"
import { describe, expect, it, vi } from "vitest"

import { createMirroredStorage } from "./mirrored-storage"
import type { PersistentStore } from "./mirrored-storage"
import { deviceStorageDefaults, deviceStorageSchema } from "./storage-keys"

/**
 * @description Builds a persistent store over a map, with spies on its writes
 * @param initial Items stored before the launch
 */
const createFakeStore = (initial: Record<string, string>) => {
    const items = new Map(Object.entries(initial))
    const store = {
        getAllKeys: () => Promise.resolve([...items.keys()]),
        multiGet: (keys: readonly string[]) =>
            Promise.resolve(
                keys.map((key): [string, string | null] => [key, items.get(key) ?? null]),
            ),
        setItem: vi.fn<PersistentStore["setItem"]>((key, value) => {
            items.set(key, value)
            return Promise.resolve()
        }),
        removeItem: vi.fn<PersistentStore["removeItem"]>(key => {
            items.delete(key)
            return Promise.resolve()
        }),
    } satisfies PersistentStore
    return { items, store }
}

const savedEventsKey = `${storagePrefix}:saved-events`

const savedEvents = {
    version: 1,
    events: [
        {
            eventId: "7d0c1c3e-5f0a-4f39-9b8e-2f5b9f3d6a10",
            date: "2026-10-24",
            savedAt: "2026-10-20T10:00:00.000Z",
        },
    ],
}

describe("createMirroredStorage", () => {
    it("reads the items stored before the launch once hydrated", async () => {
        const { store } = createFakeStore({
            [savedEventsKey]: JSON.stringify(savedEvents),
        })
        const mirror = createMirroredStorage(store)

        expect(mirror.storage.getItem(savedEventsKey)).toBeNull()
        await mirror.hydrate()
        expect(mirror.storage.getItem(savedEventsKey)).toBe(JSON.stringify(savedEvents))
    })

    it("writes each change through to the store, in call order", async () => {
        const { items, store } = createFakeStore({})
        const mirror = createMirroredStorage(store)

        mirror.storage.setItem("first", "1")
        mirror.storage.setItem("first", "2")
        mirror.storage.setItem("second", "3")
        mirror.storage.removeItem("second")
        await mirror.settled()

        expect(store.setItem.mock.calls).toStrictEqual([
            ["first", "1"],
            ["first", "2"],
            ["second", "3"],
        ])
        expect(Object.fromEntries(items)).toStrictEqual({ first: "2" })
    })

    it("keeps writing after a failed write", async () => {
        const { items, store } = createFakeStore({})
        store.setItem.mockRejectedValueOnce(new Error("disk full"))
        const mirror = createMirroredStorage(store)

        mirror.storage.setItem("first", "1")
        mirror.storage.setItem("second", "2")
        await mirror.settled()

        expect(mirror.storage.getItem("first")).toBe("1")
        expect(Object.fromEntries(items)).toStrictEqual({ second: "2" })
    })

    it("falls back to the default of a key whose stored value is not valid", async () => {
        const { store } = createFakeStore({
            [savedEventsKey]: JSON.stringify({ version: 2, events: [] }),
            [`${storagePrefix}:device-id`]: "not-json",
        })
        const mirror = createMirroredStorage(store)
        await mirror.hydrate()
        const deviceStorage = createWebStorage(
            mirror.storage,
            deviceStorageSchema,
            deviceStorageDefaults,
            storagePrefix,
        )

        expect(deviceStorage.getItem("saved-events")).toStrictEqual(
            deviceStorageDefaults["saved-events"],
        )
        expect(deviceStorage.getItem("device-id")).toBeNull()
    })
})
