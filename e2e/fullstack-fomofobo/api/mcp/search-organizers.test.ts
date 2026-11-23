import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { buildAccountSeed, signInAs } from "../auth/utils"
import { createOrganizer, listOrganizers } from "../backoffice-organizers/api"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP search_organizers", () => {
    it("answers the organizers whose name matches, as the backoffice list does", async () => {
        const { headers } = await signInAs("admin")
        const { role: _role, ...creation } = buildAccountSeed("organizer")
        const organizer = await createOrganizer({ headers, body: creation })
        expectStatus(organizer, 201)
        const { role: _other, ...other } = buildAccountSeed("organizer")
        expectStatus(await createOrganizer({ headers, body: other }), 201)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "search_organizers", {
            query: organizer.data.email,
        })

        const list = await listOrganizers({
            headers,
            queryParams: { q: organizer.data.email },
        })
        expectStatus(list, 200)
        expect(list.data.items.map(item => item.id)).toStrictEqual([organizer.data.id])
        expect(result).toStrictEqual({ isError: false, value: list.data })
    })
})
