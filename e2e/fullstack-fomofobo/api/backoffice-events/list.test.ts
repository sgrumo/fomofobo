import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createEvent, listEvents } from "./api"
import { buildEventUpsert, seedEventReferences, uploadPhoto } from "./utils"

describe("GET /api/backoffice/events", () => {
    it("answers an Organizer its own events, whatever organizerId it sends", async () => {
        const owner = await signInAs("organizer")
        const other = await signInAs("organizer")
        const { categoryId, venueId, venue } = await seedEventReferences()
        const ownPhoto = await uploadPhoto(owner.headers)
        const otherPhoto = await uploadPhoto(other.headers)
        const own = await createEvent({
            headers: owner.headers,
            body: buildEventUpsert({ venueId, categoryId, photoKeys: [ownPhoto.key] }),
        })
        expectStatus(own, 201)
        expectStatus(
            await createEvent({
                headers: other.headers,
                body: buildEventUpsert({
                    venueId,
                    categoryId,
                    photoKeys: [otherPhoto.key],
                }),
            }),
            201,
        )

        const res = await listEvents({
            headers: owner.headers,
            queryParams: { organizerId: other.account.id },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            items: [
                {
                    id: own.data.id,
                    title: own.data.title,
                    startsAt: own.data.startsAt,
                    endsAt: own.data.endsAt,
                    organizer: own.data.organizer,
                    isBlocked: false,
                    blockReason: null,
                    isRecurring: false,
                    venue: { id: venue.id, name: venue.name },
                },
            ],
            total: 1,
            page: 1,
            pageSize: 20,
            totalPages: 1,
        })
    })

    it("answers an Admin every event, latest start first, filtered by organizer", async () => {
        const admin = await signInAs("admin")
        const first = await signInAs("organizer")
        const second = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const created = await Promise.all(
            [
                {
                    session: first,
                    startsAt: "2026-10-24T21:00",
                    endsAt: "2026-10-24T23:00",
                },
                {
                    session: first,
                    startsAt: "2026-11-07T21:00",
                    endsAt: "2026-11-07T23:00",
                },
                {
                    session: second,
                    startsAt: "2026-10-31T21:00",
                    endsAt: "2026-10-31T23:00",
                },
            ].map(async ({ session, startsAt, endsAt }) => {
                const photo = await uploadPhoto(session.headers)
                const res = await createEvent({
                    headers: session.headers,
                    body: buildEventUpsert(
                        { venueId, categoryId, photoKeys: [photo.key] },
                        { startsAt, endsAt },
                    ),
                })
                expectStatus(res, 201)
                return res.data.id
            }),
        )

        const [all, ofFirst] = await Promise.all([
            listEvents({ headers: admin.headers }),
            listEvents({
                headers: admin.headers,
                queryParams: { organizerId: first.account.id },
            }),
        ])

        expectStatus(all, 200)
        expectStatus(ofFirst, 200)
        expect([
            all.data.items.map(event => event.id),
            ofFirst.data.items.map(event => event.id),
        ]).toStrictEqual([
            [created[1], created[2], created[0]],
            [created[1], created[0]],
        ])
    })
})
