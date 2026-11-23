import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { listEvents } from "../backoffice-events/api"
import { seedEvent, seedEventReferences } from "../backoffice-events/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP list_events", () => {
    it("answers the events of every organizer whose title matches, as the backoffice list does", async () => {
        const organizer = await signInAs("organizer")
        const refs = await seedEventReferences()
        const event = await seedEvent(organizer.headers, refs, {
            title: "Jazz al Chiostro",
        })
        await seedEvent(organizer.headers, refs, { title: "Rock in Rocca" })
        const admin = await signInAs("admin")
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "list_events", {
            query: "jazz",
        })

        const list = await listEvents({
            headers: admin.headers,
            queryParams: { q: "jazz" },
        })
        expectStatus(list, 200)
        expect(list.data.items.map(item => item.id)).toStrictEqual([event.id])
        expect(result).toStrictEqual({ isError: false, value: list.data })
    })
})
