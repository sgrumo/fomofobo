import { createWebStorage, storagePrefix } from "frontend-shared/storage"
import { isDefined } from "shared/values"
import { describe, expect, it } from "vitest"

import type { Theme } from "./theme"
import {
    applyStoredTheme,
    defaultTheme,
    themeClass,
    themeSchema,
    themeScript,
    themeStorageKey,
} from "./theme"

/**
 * @description Builds an in-memory `Storage`
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
 * @description Returns the classes the script adds to a root for the raw stored value
 * @param raw Raw storage value, `null` for an absent one
 */
const classesAddedFor = (raw: string | null): string[] => {
    const storage = createMemoryStorage()
    if (raw !== null) {
        storage.setItem(themeStorageKey, raw)
    }

    const added: string[] = []
    applyStoredTheme(
        storage,
        {
            classList: {
                add: (...names: string[]) => {
                    added.push(...names)
                },
            },
        },
        themeStorageKey,
    )
    return added
}

/**
 * @description Returns the classes the root must hold for the theme, per `themeClass`
 * @param theme Theme applied
 */
const classesOf = (theme: Theme): string[] => [themeClass(theme)].filter(isDefined)

describe("themeClass", () => {
    it("should map each theme to its document root class", () => {
        expect(themeClass("dark")).toBe("dark")
        expect(themeClass("system")).toBe("system")
        expect(themeClass("light")).toBeUndefined()
    })
})

describe("themeStorageKey", () => {
    it("should be the key the local storage wrapper writes for the theme", () => {
        const storage = createMemoryStorage()
        const wrapper = createWebStorage(
            storage,
            { theme: themeSchema },
            { theme: defaultTheme },
            storagePrefix,
        )
        wrapper.setItem("theme", "dark")
        expect(storage.getItem(themeStorageKey)).toBe(JSON.stringify("dark"))
    })
})

describe("applyStoredTheme", () => {
    it("should agree with themeClass for every stored theme", () => {
        for (const theme of themeSchema.options) {
            expect(classesAddedFor(JSON.stringify(theme))).toStrictEqual(classesOf(theme))
        }
    })

    it("should fall back to the default theme for an absent value", () => {
        expect(classesAddedFor(null)).toStrictEqual([defaultTheme])
    })

    it("should fall back to the default theme for an unknown or malformed value", () => {
        expect(classesAddedFor(JSON.stringify("sepia"))).toStrictEqual([defaultTheme])
        expect(classesAddedFor("{not json")).toStrictEqual([defaultTheme])
    })

    it("should fall back to the default theme when the storage throws", () => {
        const added: string[] = []
        applyStoredTheme(
            {
                getItem: () => {
                    throw new Error("denied")
                },
            },
            {
                classList: {
                    add: (name: string) => {
                        added.push(name)
                    },
                },
            },
            themeStorageKey,
        )
        expect(added).toStrictEqual([defaultTheme])
    })
})

describe("themeScript", () => {
    it("should call the function with the page globals and the storage key", () => {
        expect(themeScript).toContain(
            `(localStorage, document.documentElement, ${JSON.stringify(themeStorageKey)})`,
        )
    })
})
