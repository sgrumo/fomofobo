import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { createWebStorage } from "./storage"

const prefix = "test"
const colorKey = "color"
const colorPrefixedKey = `${prefix}:${colorKey}`

/**
 * @description Builds an in-memory `Storage`
 * @remarks Allows throw injection, unlike the jsdom `localStorage` proxy
 */
const createMemoryStorage = (): Storage => {
    const store = new Map<string, string>()
    return {
        get length() {
            return store.size
        },
        clear: () => {
            store.clear()
        },
        getItem: key => store.get(key) ?? null,
        key: index => [...store.keys()][index] ?? null,
        removeItem: key => {
            store.delete(key)
        },
        setItem: (key, value) => {
            store.set(key, value)
        },
    }
}

/**
 * @description Builds a web storage holding a single color key
 * @param storage Backing storage
 */
const buildColorStorage = (storage: Storage) =>
    createWebStorage(
        storage,
        { [colorKey]: z.enum(["red", "green", "blue"]) },
        { [colorKey]: "red" },
        prefix,
    )

describe.each([
    ["localStorage", localStorage] as const,
    ["sessionStorage", sessionStorage] as const,
])("createWebStorage(%s)", (_label, storage) => {
    beforeEach(() => {
        storage.clear()
    })

    afterEach(() => {
        storage.clear()
    })

    describe("getRawItem", () => {
        it("returns null when nothing is stored", () => {
            const webStorage = buildColorStorage(storage)

            expect(webStorage.getRawItem(colorKey)).toBeNull()
        })

        it("returns the raw stored string when one is present", () => {
            storage.setItem(colorPrefixedKey, JSON.stringify("blue"))
            const webStorage = buildColorStorage(storage)

            expect(webStorage.getRawItem(colorKey)).toBe(JSON.stringify("blue"))
        })
    })

    describe("getItem", () => {
        it("returns the default when nothing is stored", () => {
            const webStorage = buildColorStorage(storage)

            expect(webStorage.getItem(colorKey)).toBe("red")
        })

        it("returns the parsed stored item when one is present", () => {
            storage.setItem(colorPrefixedKey, JSON.stringify("blue"))
            const webStorage = buildColorStorage(storage)

            expect(webStorage.getItem(colorKey)).toBe("blue")
        })

        it("falls back to the default when the stored item is not valid JSON", () => {
            storage.setItem(colorPrefixedKey, "not-json")
            const webStorage = buildColorStorage(storage)

            expect(webStorage.getItem(colorKey)).toBe("red")
        })

        it("falls back to the default when the stored item does not match the schema", () => {
            storage.setItem(colorPrefixedKey, JSON.stringify("turquoise"))
            const webStorage = buildColorStorage(storage)

            expect(webStorage.getItem(colorKey)).toBe("red")
        })
    })

    describe("setItem", () => {
        it("persists the encoded item to storage", () => {
            const webStorage = buildColorStorage(storage)

            webStorage.setItem(colorKey, "blue")

            expect(storage.getItem(colorPrefixedKey)).toBe(JSON.stringify("blue"))
        })

        it("returns Result.ok with the decoded item on success", () => {
            const webStorage = buildColorStorage(storage)

            expect(webStorage.setItem(colorKey, "green")).toStrictEqual({
                success: true,
                value: "green",
            })
        })

        it("reads back the item it just wrote", () => {
            const webStorage = buildColorStorage(storage)

            webStorage.setItem(colorKey, "blue")

            expect(webStorage.getItem(colorKey)).toBe("blue")
        })

        it("returns Result.err type 'zod' on an item that does not match the schema", () => {
            const webStorage = buildColorStorage(storage)

            const result = webStorage.setItem(
                colorKey,
                // @ts-expect-error - intentionally invalid item to exercise runtime zod rejection
                "turquoise",
            )

            expect(result).toMatchObject({ success: false, error: { type: "zod" } })
            expect(storage.getItem(colorPrefixedKey)).toBeNull()
        })

        it("returns Result.err type 'serialization' when the encoded item is not JSON-serializable", () => {
            const webStorage = createWebStorage(
                storage,
                {
                    token: z.codec(z.bigint(), z.string(), {
                        decode: value => value.toString(),
                        encode: BigInt,
                    }),
                },
                { token: "0" },
                prefix,
            )

            const result = webStorage.setItem("token", "123")

            expect(result).toMatchObject({
                success: false,
                error: { type: "serialization" },
            })
            expect(storage.getItem(`${prefix}:token`)).toBeNull()
        })
    })

    describe("listeners", () => {
        it("notifies a registered listener on a successful write", () => {
            const webStorage = buildColorStorage(storage)
            const listener = vi.fn<() => void>()
            webStorage.listen(listener)

            webStorage.setItem(colorKey, "blue")

            expect(listener).toHaveBeenCalledOnce()
        })

        it("notifies every registered listener", () => {
            const webStorage = buildColorStorage(storage)
            const first = vi.fn<() => void>()
            const second = vi.fn<() => void>()
            webStorage.listen(first)
            webStorage.listen(second)

            webStorage.setItem(colorKey, "blue")

            expect(first).toHaveBeenCalledOnce()
            expect(second).toHaveBeenCalledOnce()
        })

        it("stops notifying after the returned unlisten is called", () => {
            const webStorage = buildColorStorage(storage)
            const listener = vi.fn<() => void>()
            const unlisten = webStorage.listen(listener)

            unlisten()
            webStorage.setItem(colorKey, "blue")

            expect(listener).not.toHaveBeenCalled()
        })

        it("does not notify listeners when the write fails", () => {
            const webStorage = buildColorStorage(storage)
            const listener = vi.fn<() => void>()
            webStorage.listen(listener)

            // @ts-expect-error - intentionally invalid item to exercise runtime zod rejection
            webStorage.setItem(colorKey, "turquoise")

            expect(listener).not.toHaveBeenCalled()
        })

        it("keeps notifying the remaining listeners when one throws, and still succeeds", () => {
            const webStorage = buildColorStorage(storage)
            const before = vi.fn<() => void>()
            const throwing = vi.fn<() => void>(() => {
                throw new Error("listener boom")
            })
            const after = vi.fn<() => void>()
            webStorage.listen(before)
            webStorage.listen(throwing)
            webStorage.listen(after)

            const result = webStorage.setItem(colorKey, "blue")

            expect(before).toHaveBeenCalledOnce()
            expect(throwing).toHaveBeenCalledOnce()
            expect(after).toHaveBeenCalledOnce()
            expect(result).toStrictEqual({ success: true, value: "blue" })
            expect(storage.getItem(colorPrefixedKey)).toBe(JSON.stringify("blue"))
        })
    })

    describe("codec pipeline", () => {
        const checkpointKey = "checkpoint"
        const checkpointPrefixedKey = `${prefix}:${checkpointKey}`
        const checkpointDefault = new Date("2020-01-01T00:00:00.000Z")

        /**
         * @description Builds a web storage holding a date behind a codec
         */
        const buildCheckpointStorage = () =>
            createWebStorage(
                storage,
                {
                    [checkpointKey]: z.codec(z.iso.datetime(), z.date(), {
                        decode: iso => new Date(iso),
                        encode: date => date.toISOString(),
                    }),
                },
                { [checkpointKey]: checkpointDefault },
                prefix,
            )

        it("decodes a pre-existing encoded item into the output type on read", () => {
            storage.setItem(
                checkpointPrefixedKey,
                JSON.stringify("2026-05-28T12:30:00.000Z"),
            )
            const webStorage = buildCheckpointStorage()

            expect(webStorage.getItem(checkpointKey)).toStrictEqual(
                new Date("2026-05-28T12:30:00.000Z"),
            )
        })

        it("encodes the item on write and decodes it back into the output type on read", () => {
            const webStorage = buildCheckpointStorage()
            const target = new Date("2026-05-28T12:30:00.000Z")

            webStorage.setItem(checkpointKey, target)

            expect(storage.getItem(checkpointPrefixedKey)).toBe(
                JSON.stringify("2026-05-28T12:30:00.000Z"),
            )
            expect(webStorage.getItem(checkpointKey)).toStrictEqual(target)
        })

        it("falls back to the default when the stored item fails decode validation", () => {
            storage.setItem(checkpointPrefixedKey, JSON.stringify("not-a-date"))
            const webStorage = buildCheckpointStorage()

            expect(webStorage.getItem(checkpointKey)).toStrictEqual(checkpointDefault)
        })
    })
})

describe("createWebStorage storage failures", () => {
    it("getRawItem returns null when the underlying storage throws", () => {
        const storage = createMemoryStorage()
        storage.getItem = () => {
            throw new Error("getItem failed")
        }
        const webStorage = buildColorStorage(storage)

        expect(webStorage.getRawItem(colorKey)).toBeNull()
    })

    it("getItem falls back to the default when the underlying storage throws", () => {
        const storage = createMemoryStorage()
        storage.getItem = () => {
            throw new Error("getItem failed")
        }
        const webStorage = buildColorStorage(storage)

        expect(webStorage.getItem(colorKey)).toBe("red")
    })

    it("setItem returns Result.err type 'storage' when the underlying storage throws", () => {
        const storage = createMemoryStorage()
        storage.setItem = () => {
            throw new Error("setItem failed")
        }
        const webStorage = buildColorStorage(storage)

        const result = webStorage.setItem(colorKey, "blue")

        expect(result).toMatchObject({ success: false, error: { type: "storage" } })
    })
})
