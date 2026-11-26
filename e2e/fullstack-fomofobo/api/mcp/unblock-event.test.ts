import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockEvent, getEvent } from "../backoffice-events/api"
import { seedEvent, seedEventReferences } from "../backoffice-events/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP unblock_event", () => {
    it("unblocks the event and clears its reason", async () => {
        const organizer = await signInAs("organizer")
        const event = await seedEvent(organizer.headers, await seedEventReferences())
        const admin = await signInAs("admin")
        expectStatus(
            await blockEvent({
                headers: admin.headers,
                pathParams: { id: event.id },
                body: { reason: "Data errata" },
            }),
            200,
        )
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "unblock_event", {
            eventId: event.id,
        })

        const read = await getEvent({
            headers: admin.headers,
            pathParams: { id: event.id },
        })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual({ ...event, updatedAt: read.data.updatedAt })
        expect(result).toStrictEqual({ isError: false, value: read.data })
    })
})
