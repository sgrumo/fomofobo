import { expectStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { getEvent } from "../backoffice-events/api"
import { seedEvent, seedEventReferences, uploadPhoto } from "../backoffice-events/utils"
import { authorizeAdmin } from "../oauth/utils"
import { getOccurrence } from "../public/api"
import { SATURDAY_NOON } from "../public/utils"
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

    it("expires the cached public detail, so the next read shows the change", async () => {
        const organizer = await signInAs("organizer")
        const event = await seedEvent(organizer.headers, await seedEventReferences())
        const cached = await getOccurrence({
            headers: { "x-test-now": SATURDAY_NOON },
            pathParams: { eventId: event.id, date: "2026-10-24" },
        })
        expectStatus(cached, 200)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "update_event", {
            eventId: event.id,
            changes: { title: "Jazz al Chiostro" },
        })

        expect(result).toMatchObject({ isError: false })
        const detail = await getOccurrence({
            headers: { "x-test-now": SATURDAY_NOON },
            pathParams: { eventId: event.id, date: "2026-10-24" },
        })
        expectStatus(detail, 200)
        expect(detail.data.title).toBe("Jazz al Chiostro")
    })

    it("removes and reorders the photos with the keys of get_event", async () => {
        const organizer = await signInAs("organizer")
        const photos = await Promise.all([
            uploadPhoto(organizer.headers),
            uploadPhoto(organizer.headers),
            uploadPhoto(organizer.headers),
        ])
        const event = await seedEvent(organizer.headers, await seedEventReferences(), {
            photoKeys: photos.map(photo => photo.key),
        })
        const [first, , third] = photos.map(photo => photo.key)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "update_event", {
            eventId: event.id,
            changes: { photoKeys: [third, first] },
        })

        expect(result).toMatchObject({ isError: false })
        const { headers } = await signInAs("admin")
        const read = await getEvent({ headers, pathParams: { id: event.id } })
        expectStatus(read, 200)
        expect(
            read.data.photos
                .toSorted((left, right) => left.position - right.position)
                .map(photo => photo.key),
        ).toStrictEqual([third, first])
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
