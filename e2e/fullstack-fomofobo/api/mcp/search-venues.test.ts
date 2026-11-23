import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createVenue, listVenues } from "../backoffice-venues/api"
import { buildVenueCreation } from "../backoffice-venues/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP search_venues", () => {
    it("answers the venues whose name matches, as the backoffice list does", async () => {
        const { headers } = await signInAs("admin")
        const venue = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(venue, 201)
        await createVenue({ headers, body: buildVenueCreation() })
        const query = venue.data.name.slice(-8)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "search_venues", { query })

        const list = await listVenues({ headers, queryParams: { q: query } })
        expectStatus(list, 200)
        expect(list.data.items.map(item => item.id)).toStrictEqual([venue.data.id])
        expect(result).toStrictEqual({ isError: false, value: list.data })
    })
})
