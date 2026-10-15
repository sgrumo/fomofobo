import { describe, expect, it } from "vitest"

import { buildNestedObject, flattenNestedObject, generateCsv } from "./translations"

describe("flattenNestedObject", () => {
    it("should flatten a simple nested object", () => {
        const nested = {
            Toast: {
                Success: {
                    Title: "Success",
                },
                Warning: {
                    Title: "Warning",
                },
            },
        }

        expect(flattenNestedObject(nested)).toStrictEqual({
            "Toast.Success.Title": "Success",
            "Toast.Warning.Title": "Warning",
        })
    })

    it("should handle top-level string values", () => {
        const nested = {
            ClearCache: "Clear cache",
            Toast: {
                Title: "Toast",
            },
        }

        expect(flattenNestedObject(nested)).toStrictEqual({
            ClearCache: "Clear cache",
            "Toast.Title": "Toast",
        })
    })

    it("should handle deeply nested objects", () => {
        const nested = {
            a: {
                b: {
                    c: {
                        d: "deep",
                    },
                },
            },
        }

        expect(flattenNestedObject(nested)).toStrictEqual({
            "a.b.c.d": "deep",
        })
    })

    it("should return empty object for empty input", () => {
        expect(flattenNestedObject({})).toStrictEqual({})
    })
})

describe("buildNestedObject", () => {
    it("should build a nested object from flat keys", () => {
        const flat = {
            "Toast.Success.Title": "Success",
            "Toast.Warning.Title": "Warning",
        }

        expect(buildNestedObject(flat)).toStrictEqual({
            Toast: {
                Success: {
                    Title: "Success",
                },
                Warning: {
                    Title: "Warning",
                },
            },
        })
    })

    it("should handle top-level keys", () => {
        const flat = {
            ClearCache: "Clear cache",
        }

        expect(buildNestedObject(flat)).toStrictEqual({
            ClearCache: "Clear cache",
        })
    })

    it("should handle deeply nested keys", () => {
        const flat = {
            "a.b.c.d": "deep",
        }

        expect(buildNestedObject(flat)).toStrictEqual({
            a: {
                b: {
                    c: {
                        d: "deep",
                    },
                },
            },
        })
    })

    it("should return empty object for empty input", () => {
        expect(buildNestedObject({})).toStrictEqual({})
    })

    it("should round-trip with flattenNestedObject", () => {
        const nested = {
            Toast: {
                Success: {
                    Title: "Success",
                },
            },
            ClearCache: "Clear cache",
            a: {
                b: {
                    c: "deep",
                },
            },
        }

        expect(buildNestedObject(flattenNestedObject(nested))).toStrictEqual(nested)
    })

    it("should overwrite string values when a deeper path conflicts", () => {
        const flat = {
            a: "leaf",
            "a.b": "deeper",
        }

        expect(buildNestedObject(flat)).toStrictEqual({
            a: {
                b: "deeper",
            },
        })
    })
})

describe("generateCsv", () => {
    it("should generate CSV with correct headers and values", () => {
        const languages = ["en", "it"]
        const translationsByLang = {
            en: {
                "Toast.Title": "Success",
                ClearCache: "Clear cache",
            },
            it: {
                "Toast.Title": "Successo",
                ClearCache: "Pulisci la cache",
            },
        }

        const csv = generateCsv(languages, translationsByLang)
        const lines = csv.split("\n")

        expect(lines[0]).toBe("ID,en,it")
        expect(lines[1]).toBe("ClearCache,Clear cache,Pulisci la cache")
        expect(lines[2]).toBe("Toast.Title,Success,Successo")
    })

    it("should escape values containing commas", () => {
        const languages = ["en"]
        const translationsByLang = {
            en: {
                Key: "hello, world",
            },
        }

        const csv = generateCsv(languages, translationsByLang)
        const lines = csv.split("\n")

        expect(lines[1]).toBe('Key,"hello, world"')
    })

    it("should escape values containing double quotes", () => {
        const languages = ["en"]
        const translationsByLang = {
            en: {
                Key: 'say "hello"',
            },
        }

        const csv = generateCsv(languages, translationsByLang)
        const lines = csv.split("\n")

        expect(lines[1]).toBe('Key,"say ""hello"""')
    })

    it("should handle missing keys in some languages", () => {
        const languages = ["en", "it"]
        const translationsByLang = {
            en: {
                OnlyEn: "English only",
                Both: "Both",
            },
            it: {
                Both: "Entrambi",
            },
        }

        const csv = generateCsv(languages, translationsByLang)
        const lines = csv.split("\n")

        expect(lines[0]).toBe("ID,en,it")
        expect(lines[1]).toBe("Both,Both,Entrambi")
        expect(lines[2]).toBe("OnlyEn,English only,")
    })

    it("should sort keys alphabetically", () => {
        const languages = ["en"]
        const translationsByLang = {
            en: {
                Zebra: "z",
                Alpha: "a",
                Middle: "m",
            },
        }

        const csv = generateCsv(languages, translationsByLang)
        const lines = csv.split("\n")

        expect(lines[1]).toBe("Alpha,a")
        expect(lines[2]).toBe("Middle,m")
        expect(lines[3]).toBe("Zebra,z")
    })
})
