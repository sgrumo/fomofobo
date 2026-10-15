import { describe, expect, it } from "vitest"

import { deobfuscate } from "./deobfuscate"
import { obfuscate } from "./obfuscate"
import { obfuscationRecipe } from "./pipeline"
import {
    base64Decode,
    base64Encode,
    reverse,
    shiftBackward,
    shiftForward,
    swap,
} from "./steps"

const inputs: Record<string, string> = {
    emptyString: "",
    singleCharacter: "a",
    shortAscii: "hello world",
    numbersAndSymbols: "1234567890 !@#$%^&*()_+-=[]{}|;':\",./<>?",
    whitespace: "  \t\n line breaks \r\n and tabs\t",
    accented: "àèìòù ñ ç ü ö ß",
    cjkText: "你好世界こんにちは안녕하세요",
    emoji: "🚀✨🔐 family: 👨‍👩‍👧‍👦 flags: 🇮🇹🇯🇵",
    jsonPayload: JSON.stringify({ id: 42, name: "Ada", roles: ["admin", "dev"] }),
    longRepeated: "abcdefghij".repeat(500),
    uuidLike: "550e8400-e29b-41d4-a716-446655440000",
    jwtLike: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.dummy-signature",
}

describe("obfuscate / deobfuscate", () => {
    it.each(Object.entries(inputs))(
        "round-trips %s back to the original value",
        (_label, value) => {
            expect(deobfuscate(obfuscate(value))).toBe(value)
        },
    )

    it("produces output different from the input for non-trivial values", () => {
        const value = "a string that should be obfuscated"
        expect(obfuscate(value)).not.toBe(value)
    })

    it("is deterministic for a given input", () => {
        const value = "deterministic"
        expect(obfuscate(value)).toBe(obfuscate(value))
    })
})

describe("step primitives", () => {
    const chars = "the quick brown fox jumps over the lazy dog".split("")

    it("`reverse` is its own inverse", () => {
        expect(reverse(reverse(chars))).toStrictEqual(chars)
    })

    it("`shiftBackward` undoes `shiftForward` for any amount", () => {
        for (const amount of [1, 47, 128, 65_535]) {
            expect(shiftBackward(amount)(shiftForward(amount)(chars))).toStrictEqual(
                chars,
            )
        }
    })

    it("`swap` is its own inverse from both ends and partial slices", () => {
        for (const fromEnd of [false, true]) {
            for (const perSlice of [2, 3, 7, 9]) {
                const transform = swap(perSlice, fromEnd)
                expect(transform(transform(chars))).toStrictEqual(chars)
            }
        }
    })

    it("`base64Decode` undoes `base64Encode`", () => {
        expect(base64Decode(base64Encode(chars))).toStrictEqual(chars)
    })
})

describe("obfuscationRecipe", () => {
    const base64Index = obfuscationRecipe.findIndex(step => step.type === "base64")

    it("includes exactly one base64 step", () => {
        const base64Steps = obfuscationRecipe.filter(step => step.type === "base64")
        expect(base64Steps).toHaveLength(1)
    })

    it("runs every shift before the base64 step", () => {
        const lastShifterIndex = obfuscationRecipe.findLastIndex(
            step => step.type === "shifter",
        )
        expect(lastShifterIndex).toBeLessThan(base64Index)
    })

    it("only reorders (swap/reverse) after the base64 step - never shifts", () => {
        const afterBase64 = obfuscationRecipe.slice(base64Index + 1)
        const onlyReordering = afterBase64.every(step =>
            ["swapper", "reverse"].includes(step.type),
        )
        expect(onlyReordering).toBe(true)
    })
})
