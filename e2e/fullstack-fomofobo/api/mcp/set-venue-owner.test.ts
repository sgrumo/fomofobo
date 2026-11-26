import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createVenue, getVenue } from "../backoffice-venues/api"
import { buildVenueCreation } from "../backoffice-venues/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP set_venue_owner", () => {
    it("gives a venue to an organizer", async () => {
        const { headers } = await signInAs("admin")
        const organizer = await signInAs("organizer")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "set_venue_owner", {
            venueId: created.data.id,
            ownerId: organizer.account.id,
        })

        const read = await getVenue({ headers, pathParams: { id: created.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual({
            ...created.data,
            owner: { id: organizer.account.id, name: organizer.account.name },
        })
        expect(result).toStrictEqual({ isError: false, value: read.data })
    })
})
