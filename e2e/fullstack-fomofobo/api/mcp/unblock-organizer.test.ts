import { expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { buildAccountSeed, seedAccount, signIn, signInAs } from "../auth/utils"
import { blockOrganizer, getOrganizer } from "../backoffice-organizers/api"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP unblock_organizer", () => {
    it("unblocks the organizer, who signs in again", async () => {
        const seed = buildAccountSeed("organizer")
        const organizer = await seedAccount(seed)
        const { headers } = await signInAs("admin")
        expectStatus(
            await blockOrganizer({ headers, pathParams: { id: organizer.id } }),
            200,
        )
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "unblock_organizer", {
            organizerId: organizer.id,
        })

        const read = await getOrganizer({ headers, pathParams: { id: organizer.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(organizer)
        expect(result).toStrictEqual({ isError: false, value: read.data })
        expectRawStatus(await signIn(seed), 200)
    })
})
