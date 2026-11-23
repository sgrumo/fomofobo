import { expectStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"
import { z } from "zod"

import { buildAccountSeed, seedAccount, signInAs } from "../auth/utils"
import { getEvent } from "../backoffice-events/api"
import { buildEventUpsert, seedEventReferences } from "../backoffice-events/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool, toolValueOf } from "./api"

/**
 * @description Builds the input of create_event: an event payload with no photo, for the organizer
 * @param refs Venue and primary category of the event
 * @param organizerId Organizer of the event
 */
const buildCreateEventInput = (
    refs: { venueId: string; categoryId: string },
    organizerId: string,
) => {
    const { photoKeys: _photoKeys, ...fields } = buildEventUpsert(
        { ...refs, photoKeys: [] },
        { startsAt: "2027-03-13T21:00", endsAt: "2027-03-13T23:30" },
    )
    return { ...fields, organizerId }
}

describe("MCP create_event", () => {
    it("publishes the event with no photo, for the organizer, and links its backoffice page", async () => {
        const refs = await seedEventReferences()
        const organizer = await seedAccount(buildAccountSeed("organizer"))
        const input = buildCreateEventInput(refs, organizer.id)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "create_event", input)

        const { event } = z
            .object({ event: z.object({ id: z.uuid() }) })
            .parse(toolValueOf(result))
        const { headers } = await signInAs("admin")
        const read = await getEvent({ headers, pathParams: { id: event.id } })
        expectStatus(read, 200)
        expect(read.data).toMatchObject({
            title: input.title,
            startsAt: input.startsAt,
            photos: [],
            organizer: { id: organizer.id, name: organizer.name },
        })
        expect(result).toStrictEqual({
            isError: false,
            value: {
                event: read.data,
                backofficeUrl: `${publishedAppUrl()}/backoffice/events/${read.data.id}`,
            },
        })
    })

    it("answers an end before the start as a tool error that names the field", async () => {
        const refs = await seedEventReferences()
        const organizer = await seedAccount(buildAccountSeed("organizer"))
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "create_event", {
            ...buildCreateEventInput(refs, organizer.id),
            endsAt: "2027-03-13T20:00",
        })

        expect(result).toStrictEqual({
            isError: true,
            text: "InvalidRequest: endsAt: must be after the start",
        })
    })

    it("answers an unknown venue as a tool error with the code of the service", async () => {
        const refs = await seedEventReferences()
        const organizer = await seedAccount(buildAccountSeed("organizer"))
        const { tokens } = await authorizeAdmin()

        const result = await callTool(
            tokens.access_token,
            "create_event",
            buildCreateEventInput(
                { ...refs, venueId: crypto.randomUUID() },
                organizer.id,
            ),
        )

        expect(result).toStrictEqual({
            isError: true,
            text: expect.stringMatching(/^InvalidEventReference: /u),
        })
    })
})
