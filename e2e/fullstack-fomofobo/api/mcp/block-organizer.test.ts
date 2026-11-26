import { expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { buildAccountSeed, seedAccount, signIn, signInAs } from "../auth/utils"
import { getOrganizer } from "../backoffice-organizers/api"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP block_organizer", () => {
    it("blocks the organizer, who then cannot sign in", async () => {
        const seed = buildAccountSeed("organizer")
        const organizer = await seedAccount(seed)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "block_organizer", {
            organizerId: organizer.id,
        })

        const { headers } = await signInAs("admin")
        const read = await getOrganizer({ headers, pathParams: { id: organizer.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual({ ...organizer, isBlocked: true })
        expect(result).toStrictEqual({ isError: false, value: read.data })
        expectRawStatus(await signIn(seed), 401)
    })
})
