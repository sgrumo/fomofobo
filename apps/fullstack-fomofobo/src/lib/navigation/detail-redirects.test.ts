import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match"
import { prepareDestination } from "next/dist/shared/lib/router/utils/prepare-destination"
import { describe, expect, it } from "vitest"

import { detailRedirects } from "./detail-redirects"

/**
 * @description Returns the URL the first matching redirect builds, `undefined` with none
 * @param pathname Pathname requested
 * @remarks Runs the matcher and the destination builder of Next itself
 */
const redirectOf = (pathname: string): string | undefined => {
    for (const redirect of detailRedirects) {
        const params = getPathMatch(redirect.source, {
            strict: true,
            removeUnnamedParams: true,
        })(pathname)
        if (params !== false) {
            const { newUrl, parsedDestination } = prepareDestination({
                appendParamsToQuery: false,
                destination: redirect.destination,
                params,
                query: {},
            })
            return `${newUrl}${parsedDestination.search}`
        }
    }
    return undefined
}

describe("detailRedirects", () => {
    it("should open the map with the event detail in place of the event page", () => {
        expect(redirectOf("/it/events/e1/2026-10-24")).toBe(
            "/it?event=e1&occurrence=2026-10-24&detail=true",
        )
    })

    it("should open the map with the venue detail in place of the venue page", () => {
        expect(redirectOf("/it/venues/v1")).toBe("/it?venue=v1&detail=true")
    })

    it("should leave the map and the other pages alone", () => {
        expect(redirectOf("/it")).toBeUndefined()
        expect(redirectOf("/it/saved")).toBeUndefined()
        expect(redirectOf("/it/events/e1")).toBeUndefined()
    })
})
