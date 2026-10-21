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
        expect(redirectOf("/")).toBe("/it")
    })

    it("should prefix a path with no language", () => {
        expect(redirectOf("/saved")).toBe("/it/saved")
        expect(redirectOf("/events/a/2026-10-24")).toBe("/it/events/a/2026-10-24")
        expect(redirectOf("/dev/showcase")).toBe("/it/dev/showcase")
    })

    it("should replace an unsupported two-letter language", () => {
        expect(redirectOf("/en")).toBe("/it")
        expect(redirectOf("/en/events/a/2026-10-24")).toBe("/it/events/a/2026-10-24")
        expect(redirectOf("/de/saved")).toBe("/it/saved")
    })

    it("should leave a supported language alone", () => {
        expect(redirectOf("/it")).toBeUndefined()
        expect(redirectOf("/it/events/a/2026-10-24")).toBeUndefined()
    })

    it("should read the language as a whole segment", () => {
        expect(redirectOf("/entries")).toBe("/it/entries")
        expect(redirectOf("/italy/saved")).toBe("/it/italy/saved")
    })

    it("should leave the route handlers, the Next assets and the public files alone", () => {
        expect(redirectOf("/api/health")).toBeUndefined()
        expect(redirectOf("/auth/logout")).toBeUndefined()
        expect(redirectOf("/backoffice/login")).toBeUndefined()
        expect(redirectOf("/_next/static/chunk.js")).toBeUndefined()
        expect(redirectOf("/favicon.ico")).toBeUndefined()
        expect(redirectOf("/locales/it/shared.json")).toBeUndefined()
    })
})
