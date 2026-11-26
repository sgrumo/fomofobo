import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createCategory } from "../backoffice-categories/api"
import { buildCategoryCreation } from "../backoffice-categories/utils"
import { createVenue, getVenue } from "../backoffice-venues/api"
import { buildCinemaKind, buildVenueCreation } from "../backoffice-venues/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP set_venue_kind", () => {
    it("makes a venue a cinema with its programme, category and closing days", async () => {
        const { headers } = await signInAs("admin")
        const category = await createCategory({ headers, body: buildCategoryCreation() })
        expectStatus(category, 201)
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)
        const cinema = buildCinemaKind(category.data.id)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "set_venue_kind", {
            venueId: created.data.id,
            change: cinema,
        })

        const read = await getVenue({ headers, pathParams: { id: created.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual({ ...created.data, ...cinema })
        expect(result).toStrictEqual({ isError: false, value: read.data })
    })
})
