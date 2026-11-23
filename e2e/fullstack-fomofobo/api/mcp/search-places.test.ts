import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { authorizeAdmin } from "../oauth/utils"
import { searchPlaces } from "../public/api"
import { callTool } from "./api"

describe("MCP search_places", () => {
    it("answers the places of the provider, as the public search does", async () => {
        const center = { lat: 44.35, lng: 11.71 }
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "search_places", {
            query: "via emilia 10",
            ...center,
        })

        const search = await searchPlaces({
            headers: { "x-forwarded-for": crypto.randomUUID() },
            queryParams: { q: "via emilia 10", ...center },
        })
        expectStatus(search, 200)
        expect(search.data.places).not.toHaveLength(0)
        expect(result).toStrictEqual({
            isError: false,
            value: { places: search.data.places },
        })
    })
})
