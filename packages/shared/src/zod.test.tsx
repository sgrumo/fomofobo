import { describe, expect, it } from "vitest"
import { z } from "zod"

import { codecs } from "./zod"

describe("codecs.stringToNumber", () => {
    const codec = codecs.stringToNumber

    describe("decode", () => {
        it("decodes valid numeric strings", () => {
            expect(codec.decode("0")).toBe(0)
            expect(codec.decode("42")).toBe(42)
            expect(codec.decode("-42")).toBe(-42)
            expect(codec.decode("3.14")).toBe(3.14)
            expect(codec.decode("-0.5")).toBe(-0.5)
        })

        it("rejects invalid numeric strings", () => {
            const result = codec.safeDecode("abc")
            expect(result.success).toBe(false)
        })
    })

    describe("encode", () => {
        it("encodes numbers to strings", () => {
            expect(codec.encode(0)).toBe("0")
            expect(codec.encode(42)).toBe("42")
            expect(codec.encode(-42)).toBe("-42")
            expect(codec.encode(3.14)).toBe("3.14")
        })
    })

    describe("round-trip", () => {
        it("decode -> encode preserves value", () => {
            const value = "123.45"
            const decoded = codec.decode(value)
            const encoded = codec.encode(decoded)

            expect(encoded).toBe("123.45")
        })
    })
})

describe("codecs.stringToInt", () => {
    const codec = codecs.stringToInt

    describe("decode", () => {
        it("decodes integer strings", () => {
            expect(codec.decode("0")).toBe(0)
            expect(codec.decode("42")).toBe(42)
            expect(codec.decode("-42")).toBe(-42)
        })

        it("rejects a decimal or a non-numeric string", () => {
            expect(codec.safeDecode("3.14").success).toBe(false)
            expect(codec.safeDecode("abc").success).toBe(false)
            expect(codec.safeDecode("").success).toBe(false)
        })
    })

    describe("encode", () => {
        it("encodes integers to strings", () => {
            expect(codec.encode(0)).toBe("0")
            expect(codec.encode(42)).toBe("42")
            expect(codec.encode(-42)).toBe("-42")
        })
    })

    describe("composition", () => {
        it("keeps the default and the fallback in both directions", () => {
            const page = codec.pipe(z.int().min(1)).default(1).catch(1)
            expect(page.decode(undefined)).toBe(1)
            expect(page.decode("3")).toBe(3)
            expect(page.decode("0")).toBe(1)
            expect(page.decode("abc")).toBe(1)
            expect(page.encode(2)).toBe("2")
        })
    })
})
