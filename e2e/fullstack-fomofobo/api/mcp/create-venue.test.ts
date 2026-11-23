import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"
import { z } from "zod"

import { signInAs } from "../auth/utils"
import { getVenue } from "../backoffice-venues/api"
import { buildVenueCreation } from "../backoffice-venues/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool, toolValueOf } from "./api"

describe("MCP create_venue", () => {
    it("persists a venue with no owner, as the backoffice reads it back", async () => {
        const creation = buildVenueCreation()
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "create_venue", creation)

        const { id } = z.object({ id: z.uuid() }).parse(toolValueOf(result))
        const { headers } = await signInAs("admin")
        const read = await getVenue({ headers, pathParams: { id } })
        expectStatus(read, 200)
        expect(read.data).toMatchObject({ ...creation, owner: null })
        expect(result).toStrictEqual({ isError: false, value: read.data })
    })
})
