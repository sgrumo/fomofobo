import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockVenue, createVenue, getVenue } from "../backoffice-venues/api"
import { buildVenueCreation } from "../backoffice-venues/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP unblock_venue", () => {
    it("unblocks the venue and clears its reason", async () => {
        const { headers } = await signInAs("admin")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)
        expectStatus(
            await blockVenue({
                headers,
                pathParams: { id: created.data.id },
                body: { reason: "Locale chiuso" },
            }),
            200,
        )
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "unblock_venue", {
            venueId: created.data.id,
        })

        const read = await getVenue({ headers, pathParams: { id: created.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(created.data)
        expect(result).toStrictEqual({ isError: false, value: read.data })
    })
})
