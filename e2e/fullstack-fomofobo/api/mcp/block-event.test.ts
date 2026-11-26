import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { getEvent } from "../backoffice-events/api"
import { seedEvent, seedEventReferences } from "../backoffice-events/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP block_event", () => {
    it("blocks the event with its reason", async () => {
        const organizer = await signInAs("organizer")
        const event = await seedEvent(organizer.headers, await seedEventReferences())
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "block_event", {
            eventId: event.id,
            reason: "Data errata",
        })

        const read = await getEvent({
            headers: organizer.headers,
            pathParams: { id: event.id },
        })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual({
            ...event,
            isBlocked: true,
            blockReason: "Data errata",
            updatedAt: read.data.updatedAt,
        })
        expect(result).toStrictEqual({ isError: false, value: read.data })
    })
})
