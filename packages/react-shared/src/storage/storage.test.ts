import { act, renderHook } from "@testing-library/react"
import { createWebStorage } from "frontend-shared/storage"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from "vitest"
import { z } from "zod"

import { createUseWebStorage } from "./storage"

const itemIndex = 0
const setterIndex = 1

const prefix = "test"
const storageKey = "color"
const storagePrefixedKey = `${prefix}:${storageKey}`

/**
 * @description Builds a storage hook holding a single color key
 * @param storage Backing storage
 */
const buildUseTestStorage = (storage: Storage) => {
    const schema = {
        [storageKey]: z.enum(["red", "green", "blue"]),
    }
    const defaults: {
        [K in typeof storageKey]: z.output<(typeof schema)[K]>
    } = {
        [storageKey]: "red",
    }
    return createUseWebStorage(createWebStorage(storage, schema, defaults, prefix))
}

describe.each([
    ["createUseWebStorage(localStorage)", localStorage] as const,
    ["createUseWebStorage(sessionStorage)", sessionStorage] as const,
])("%s", (_label, storage) => {
    const useTestStorage = buildUseTestStorage(storage)

    beforeEach(() => {
        storage.clear()
    })

    afterEach(() => {
        storage.clear()
    })

    describe("reads", () => {
        it("returns the default when nothing is stored", () => {
            const { result } = renderHook(() => useTestStorage(storageKey))

            expect(result.current[itemIndex]).toBe("red")
        })

        it("returns the parsed stored item when one is present", () => {
            storage.setItem(storagePrefixedKey, JSON.stringify("blue"))

            const { result } = renderHook(() => useTestStorage(storageKey))

            expect(result.current[itemIndex]).toBe("blue")
        })

        it("falls back to the default when the stored item is not valid JSON", () => {
            storage.setItem(storagePrefixedKey, "not-json")

            const { result } = renderHook(() => useTestStorage(storageKey))

            expect(result.current[itemIndex]).toBe("red")
        })

        it("falls back to the default when the stored item does not match the schema", () => {
            storage.setItem(storagePrefixedKey, JSON.stringify("turquoise"))

            const { result } = renderHook(() => useTestStorage(storageKey))

            expect(result.current[itemIndex]).toBe("red")
        })

        it("renders the default on the server, whatever the storage holds", () => {
            storage.setItem(storagePrefixedKey, JSON.stringify("blue"))
            const Item = () =>
                createElement("span", null, useTestStorage(storageKey)[itemIndex])

            expect(renderToString(createElement(Item))).toBe("<span>red</span>")
        })
    })

    describe("writes", () => {
        it("persists the raw item to storage", () => {
            const { result } = renderHook(() => useTestStorage(storageKey))

            act(() => {
                result.current[setterIndex]("blue")
            })

            expect(storage.getItem(storagePrefixedKey)).toBe(JSON.stringify("blue"))
        })

        it("updates the returned item after a successful write", () => {
            const { result } = renderHook(() => useTestStorage(storageKey))

            act(() => {
                result.current[setterIndex]("blue")
            })

            expect(result.current[itemIndex]).toBe("blue")
        })

        it("returns Result.ok with the decoded item on success", () => {
            const { result } = renderHook(() => useTestStorage(storageKey))
            const captured: unknown[] = []

            act(() => {
                captured.push(result.current[setterIndex]("green"))
            })

            expect(captured[0]).toStrictEqual({ success: true, value: "green" })
        })

        it("returns Result.err with type 'zod' on an item that does not match the schema", () => {
            const { result } = renderHook(() => useTestStorage(storageKey))
            const captured: unknown[] = []

            act(() => {
                // @ts-expect-error - intentionally invalid item to exercise runtime zod rejection
                captured.push(result.current[setterIndex]("turquoise"))
            })

            expect(captured[0]).toMatchObject({
                success: false,
                error: { type: "zod" },
            })
            expect(storage.getItem(storagePrefixedKey)).toBeNull()
        })

        it("survives a round trip via a freshly mounted hook", () => {
            const { result, unmount } = renderHook(() => useTestStorage(storageKey))

            act(() => {
                result.current[setterIndex]("blue")
            })
            unmount()

            const { result: nextResult } = renderHook(() => useTestStorage(storageKey))
            expect(nextResult.current[itemIndex]).toBe("blue")
        })
    })

    describe("subscriptions", () => {
        it("notifies other mounted hooks of the same key", () => {
            const { result: a } = renderHook(() => useTestStorage(storageKey))
            const { result: b } = renderHook(() => useTestStorage(storageKey))

            act(() => {
                a.current[setterIndex]("blue")
            })

            expect(a.current[itemIndex]).toBe("blue")
            expect(b.current[itemIndex]).toBe("blue")
        })

        it("stops notifying after a subscriber unmounts", () => {
            const { result: a, unmount: unmountA } = renderHook(() =>
                useTestStorage(storageKey),
            )
            const { result: b } = renderHook(() => useTestStorage(storageKey))

            unmountA()

            act(() => {
                b.current[setterIndex]("green")
            })

            expect(a.current[itemIndex]).toBe("red")
            expect(b.current[itemIndex]).toBe("green")
        })
    })

    describe("codec pipeline", () => {
        const codecPrefix = "codec-test"
        const codecKey = "checkpoint"
        const codecPrefixedKey = `${codecPrefix}:${codecKey}`
        const codecDefault = new Date("2020-01-01T00:00:00.000Z")
        const codecSchema = {
            [codecKey]: z.codec(z.iso.datetime(), z.date(), {
                decode: iso => new Date(iso),
                encode: date => date.toISOString(),
            }),
        }
        const codecDefaults: {
            [K in typeof codecKey]: z.output<(typeof codecSchema)[K]>
        } = {
            [codecKey]: codecDefault,
        }
        const useCodecStorage = createUseWebStorage(
            createWebStorage(storage, codecSchema, codecDefaults, codecPrefix),
        )

        it("decodes a pre-existing encoded item into the output type on read", () => {
            storage.setItem(codecPrefixedKey, JSON.stringify("2026-05-28T12:30:00.000Z"))

            const { result } = renderHook(() => useCodecStorage(codecKey))
            const item = result.current[itemIndex]

            expect(item).toBeInstanceOf(Date)
            expect(item).toStrictEqual(new Date("2026-05-28T12:30:00.000Z"))
        })

        it("encodes the item on write and decodes it back into the output type on read", () => {
            const { result } = renderHook(() => useCodecStorage(codecKey))
            const target = new Date("2026-05-28T12:30:00.000Z")

            act(() => {
                result.current[setterIndex](target)
            })

            expect(storage.getItem(codecPrefixedKey)).toBe(
                JSON.stringify("2026-05-28T12:30:00.000Z"),
            )
            expect(result.current[itemIndex]).toStrictEqual(target)
        })

        it("falls back to the default when the stored item fails decode validation", () => {
            storage.setItem(codecPrefixedKey, JSON.stringify("not-a-date"))

            const { result } = renderHook(() => useCodecStorage(codecKey))

            expect(result.current[itemIndex]).toStrictEqual(codecDefault)
        })
    })
})

describe("createUseWebStorage types", () => {
    it("narrows the item and setter input to the z.enum literal union", () => {
        const useColorStorage = createUseWebStorage(
            createWebStorage(
                localStorage,
                { color: z.enum(["red", "green", "blue"]) },
                { color: "red" },
                prefix,
            ),
        )
        type Hook = ReturnType<typeof useColorStorage<"color">>

        expectTypeOf<Hook[typeof itemIndex]>().toEqualTypeOf<"red" | "green" | "blue">()
        expectTypeOf<Parameters<Hook[typeof setterIndex]>[0]>().toEqualTypeOf<
            "red" | "green" | "blue"
        >()
    })

    it("uses the codec output type for the item and setter input", () => {
        const useCheckpointStorage = createUseWebStorage(
            createWebStorage(
                localStorage,
                {
                    checkpoint: z.codec(z.iso.datetime(), z.date(), {
                        decode: iso => new Date(iso),
                        encode: date => date.toISOString(),
                    }),
                },
                { checkpoint: new Date() },
                prefix,
            ),
        )
        type Hook = ReturnType<typeof useCheckpointStorage<"checkpoint">>

        expectTypeOf<Hook[typeof itemIndex]>().toEqualTypeOf<Date>()
        expectTypeOf<Parameters<Hook[typeof setterIndex]>[0]>().toEqualTypeOf<Date>()
    })
})
