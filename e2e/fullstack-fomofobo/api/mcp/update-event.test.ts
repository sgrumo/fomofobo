import { expectStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { getEvent } from "../backoffice-events/api"
import { seedEvent, seedEventReferences } from "../backoffice-events/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP update_event", () => {
    it("changes the fields it receives and keeps every other one, the photos included", async () => {
        const organizer = await signInAs("organizer")
        const event = await seedEvent(organizer.headers, await seedEventReferences())
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "update_event", {
            eventId: event.id,
            changes: { title: "Jazz al Chiostro", capacity: 120 },
        })

        const { headers } = await signInAs("admin")
        const read = await getEvent({ headers, pathParams: { id: event.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual({
            ...event,
            title: "Jazz al Chiostro",
            capacity: 120,
            updatedAt: read.data.updatedAt,
        })
        expect(result).toStrictEqual({
            isError: false,
            value: {
                event: read.data,
                backofficeUrl: `${publishedAppUrl()}/backoffice/events/${event.id}`,
            },
        })
    })

    it("answers a change that breaks the event as a tool error, and leaves it untouched", async () => {
        const organizer = await signInAs("organizer")
        const event = await seedEvent(organizer.headers, await seedEventReferences())
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "update_event", {
            eventId: event.id,
            changes: { primaryCategoryId: crypto.randomUUID() },
        })

        expect(result).toStrictEqual({
            isError: true,
            text: "InvalidRequest: primaryCategoryId: must be one of the categories",
        })
        const { headers } = await signInAs("admin")
        const read = await getEvent({ headers, pathParams: { id: event.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(event)
    })
})
