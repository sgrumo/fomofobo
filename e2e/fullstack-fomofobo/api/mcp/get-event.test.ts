import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { getEvent } from "../backoffice-events/api"
import { seedEvent, seedEventReferences } from "../backoffice-events/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP get_event", () => {
    it("answers the event, as the backoffice read does", async () => {
        const organizer = await signInAs("organizer")
        const event = await seedEvent(organizer.headers, await seedEventReferences())
        const admin = await signInAs("admin")
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "get_event", {
            eventId: event.id,
        })

        const read = await getEvent({
            headers: admin.headers,
            pathParams: { id: event.id },
        })
        expectStatus(read, 200)
        expect(result).toStrictEqual({ isError: false, value: read.data })
    })

    it("answers an unknown event as a tool error that names the code", async () => {
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "get_event", {
            eventId: crypto.randomUUID(),
        })

        expect(result).toStrictEqual({
            isError: true,
            text: expect.stringMatching(/^EventNotFound: /u),
        })
    })
})
