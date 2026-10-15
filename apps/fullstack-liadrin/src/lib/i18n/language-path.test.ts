import { describe, expect, it } from "vitest"

import { replaceLanguage } from "./language-path"

describe("replaceLanguage", () => {
    it("should replace the first segment", () => {
        expect(replaceLanguage("/en/todos/search", "it")).toBe("/it/todos/search")
    })

    it("should replace the only segment of the root", () => {
        expect(replaceLanguage("/en", "it")).toBe("/it")
    })

    it("should keep an encoded segment as it is", () => {
        expect(replaceLanguage("/it/todos/a%20b", "en")).toBe("/en/todos/a%20b")
    })
})
