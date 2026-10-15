import { describe, expect, it } from "vitest"

import { sanitizeReturnPath } from "./return-path"

const baseUrl = "http://localhost:3000"

/**
 * @description Sanitizes the candidate against the base URL of the suite
 * @param candidate Value read from the query parameter
 */
const sanitize = (candidate: string | null): string =>
    sanitizeReturnPath(candidate, baseUrl)

describe("sanitizeReturnPath", () => {
    it("should keep a path of this application", () => {
        expect(sanitize("/todos")).toBe("/todos")
        expect(sanitize("/todos/search?text=milk")).toBe("/todos/search?text=milk")
    })

    it("should refuse an absolute URL, which would leave this origin", () => {
        expect(sanitize("https://evil.example.com")).toBe("/en")
        expect(sanitize("http://evil.example.com/todos")).toBe("/en")
    })

    it("should refuse a protocol-relative path, which leaves this origin too", () => {
        expect(sanitize("//evil.example.com")).toBe("/en")
    })

    it("should refuse a backslash path, which the URL parser reads as two slashes", () => {
        // The parser maps `\` to `/` for an http base, so this one resolves to
        // another origin while it reads as a path of this app.
        expect(sanitize(String.raw`/\evil.example.com`)).toBe("/en")
        expect(sanitize(String.raw`/\/evil.example.com`)).toBe("/en")
    })

    it("should resolve a relative path inside this origin", () => {
        expect(sanitize("todos")).toBe("/todos")
    })

    it("should read an absent value as the root of the default language", () => {
        expect(sanitize(null)).toBe("/en")
    })

    it("should keep the bare root, which the redirects send to the default language", () => {
        expect(sanitize("")).toBe("/")
        expect(sanitize("/")).toBe("/")
    })

    it("should drop the origin of a URL that names this app", () => {
        expect(sanitize(`${baseUrl}/files`)).toBe("/files")
    })
})
