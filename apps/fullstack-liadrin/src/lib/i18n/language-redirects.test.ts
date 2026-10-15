import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match"
import { prepareDestination } from "next/dist/shared/lib/router/utils/prepare-destination"
import { describe, expect, it } from "vitest"

import { languageRedirects } from "./language-redirects"

/**
 * @description Returns the URL the first matching redirect builds, `undefined` with none
 * @param pathname Pathname requested
 * @remarks Runs the matcher and the destination builder of Next itself
 */
const redirectOf = (pathname: string): string | undefined => {
    for (const redirect of languageRedirects) {
        const params = getPathMatch(redirect.source, {
            strict: true,
            removeUnnamedParams: true,
        })(pathname)
        if (params !== false) {
            return prepareDestination({
                appendParamsToQuery: false,
                destination: redirect.destination,
                params,
                query: {},
            }).newUrl
        }
    }
    return undefined
}

describe("languageRedirects", () => {
    it("should send the bare root to the default language", () => {
        expect(redirectOf("/")).toBe("/en")
    })

    it("should prefix a path with no language", () => {
        expect(redirectOf("/todos")).toBe("/en/todos")
        expect(redirectOf("/todos/search")).toBe("/en/todos/search")
        expect(redirectOf("/dev/showcase")).toBe("/en/dev/showcase")
    })

    it("should replace an unsupported two-letter language", () => {
        expect(redirectOf("/de")).toBe("/en")
        expect(redirectOf("/de/todos/search")).toBe("/en/todos/search")
    })

    it("should leave a supported language alone", () => {
        expect(redirectOf("/en")).toBeUndefined()
        expect(redirectOf("/en/todos")).toBeUndefined()
        expect(redirectOf("/it/todos/search")).toBeUndefined()
    })

    it("should read the language as a whole segment", () => {
        expect(redirectOf("/entries")).toBe("/en/entries")
        expect(redirectOf("/italy/todos")).toBe("/en/italy/todos")
    })

    it("should leave the route handlers, the Next assets and the public files alone", () => {
        expect(redirectOf("/api/health")).toBeUndefined()
        expect(redirectOf("/auth/login")).toBeUndefined()
        expect(redirectOf("/_next/static/chunk.js")).toBeUndefined()
        expect(redirectOf("/favicon.ico")).toBeUndefined()
        expect(redirectOf("/locales/en/shared.json")).toBeUndefined()
    })
})
