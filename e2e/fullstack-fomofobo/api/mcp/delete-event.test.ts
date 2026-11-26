import { expectApiError } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { getEvent } from "../backoffice-events/api"
import { seedEvent, seedEventReferences } from "../backoffice-events/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP delete_event", () => {
    it("deletes the event of any organizer", async () => {
        const organizer = await signInAs("organizer")
        const event = await seedEvent(organizer.headers, await seedEventReferences())
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "delete_event", {
            eventId: event.id,
        })

        expect(result).toStrictEqual({
            isError: false,
            value: { deletedEventId: event.id },
        })
        const { headers } = await signInAs("admin")
        expectApiError(await getEvent({ headers, pathParams: { id: event.id } }), 404, {
            code: "EventNotFound",
        })
    })

    it("answers an unknown event as a tool error that names the code", async () => {
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "delete_event", {
            eventId: crypto.randomUUID(),
        })

        expect(result).toStrictEqual({
            isError: true,
            text: expect.stringMatching(/^EventNotFound: /u),
        })
    })
})
