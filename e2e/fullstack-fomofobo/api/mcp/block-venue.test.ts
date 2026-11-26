import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createVenue, getVenue } from "../backoffice-venues/api"
import { buildVenueCreation } from "../backoffice-venues/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP block_venue", () => {
    it("blocks the venue with its reason", async () => {
        const { headers } = await signInAs("admin")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "block_venue", {
            venueId: created.data.id,
            reason: "Locale chiuso",
        })

        const read = await getVenue({ headers, pathParams: { id: created.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual({
            ...created.data,
            isBlocked: true,
            blockReason: "Locale chiuso",
        })
        expect(result).toStrictEqual({ isError: false, value: read.data })
    })
})
