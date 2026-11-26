import { expectStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { anyIsoDateTime, anyUuid } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"
import { z } from "zod"

import { buildAccountSeed, signInAs } from "../auth/utils"
import { getOrganizer } from "../backoffice-organizers/api"
import { authorizeAdmin } from "../oauth/utils"
import { callTool, toolValueOf } from "./api"

describe("MCP create_organizer", () => {
    it("creates the organizer and links the backoffice page where the Admin sets its password", async () => {
        const { name, email } = buildAccountSeed("organizer")
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "create_organizer", {
            name,
            email,
        })

        const organizer = {
            id: anyUuid,
            name,
            email,
            role: "organizer",
            isBlocked: false,
            createdAt: anyIsoDateTime,
        }
        const backofficeUrl = new URL(`${publishedAppUrl()}/backoffice/organizers`)
        backofficeUrl.searchParams.set("q", email)
        expect(result).toStrictEqual({
            isError: false,
            value: { organizer, backofficeUrl: backofficeUrl.toString() },
        })
        const { headers } = await signInAs("admin")
        const read = await getOrganizer({
            headers,
            pathParams: {
                id: z
                    .object({ organizer: z.object({ id: z.uuid() }) })
                    .parse(toolValueOf(result)).organizer.id,
            },
        })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(organizer)
    })
})
