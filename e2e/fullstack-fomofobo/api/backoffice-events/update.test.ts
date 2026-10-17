import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockEvent, createEvent, getEvent, updateEvent } from "./api"
import {
    buildEventUpsert,
    downloadPhoto,
    seedEventReferences,
    uploadPhoto,
} from "./utils"

describe("PUT /api/backoffice/events/{id}", () => {
    it("replaces the fields and the photos, and deletes a removed photo from the bucket", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const removed = await uploadPhoto(headers)
        const kept = await uploadPhoto(headers)
        const added = await uploadPhoto(headers)
        const created = await createEvent({
            headers,
            body: buildEventUpsert({
                venueId,
                categoryId,
                photoKeys: [removed.key, kept.key],
            }),
        })
        expectStatus(created, 201)
        const upsert = buildEventUpsert(
            { venueId, categoryId, photoKeys: [added.key, kept.key] },
            { title: "Jazz al chiostro", price: null },
        )

        const res = await updateEvent({
            headers,
            pathParams: { id: created.data.id },
            body: upsert,
        })

        expectStatus(res, 200)
        expect(res.data).toMatchObject({
            title: "Jazz al chiostro",
            price: null,
            photos: [
                { position: 0, key: added.key },
                {
                    id: created.data.photos[1]?.id,
                    url: created.data.photos[1]?.url,
                    position: 1,
                    key: kept.key,
                },
            ],
        })
        const read = await getEvent({ headers, pathParams: { id: created.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(res.data)
        expect(
            await Promise.all([
                downloadPhoto(created.data.photos[0]?.url ?? ""),
                downloadPhoto(res.data.photos[0]?.url ?? ""),
            ]),
        ).toStrictEqual([null, added.bytes])
    })

    it("lets an Admin edit the event of an Organizer with its own photo, then the Organizer edit it", async () => {
        const organizer = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const organizerPhoto = await uploadPhoto(organizer.headers)
        const adminPhoto = await uploadPhoto(admin.headers)
        const created = await createEvent({
            headers: organizer.headers,
            body: buildEventUpsert({
                venueId,
                categoryId,
                photoKeys: [organizerPhoto.key],
            }),
        })
        expectStatus(created, 201)
        const photoKeys = [organizerPhoto.key, adminPhoto.key]

        const byAdmin = await updateEvent({
            headers: admin.headers,
            pathParams: { id: created.data.id },
            body: buildEventUpsert({ venueId, categoryId, photoKeys }),
        })
        const byOrganizer = await updateEvent({
            headers: organizer.headers,
            pathParams: { id: created.data.id },
            body: buildEventUpsert(
                { venueId, categoryId, photoKeys },
                { title: "Rinviato" },
            ),
        })

        expectStatus(byAdmin, 200)
        expectStatus(byOrganizer, 200)
        expect(byOrganizer.data).toMatchObject({
            title: "Rinviato",
            organizer: created.data.organizer,
            photos: byAdmin.data.photos,
        })
    })

    it("keeps the block of an event that its Organizer edits", async () => {
        const organizer = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(organizer.headers)
        const created = await createEvent({
            headers: organizer.headers,
            body: buildEventUpsert({ venueId, categoryId, photoKeys: [photo.key] }),
        })
        expectStatus(created, 201)
        expectStatus(
            await blockEvent({
                headers: admin.headers,
                pathParams: { id: created.data.id },
                body: { reason: "Foto non pertinenti" },
            }),
            200,
        )

        const res = await updateEvent({
            headers: organizer.headers,
            pathParams: { id: created.data.id },
            body: buildEventUpsert({ venueId, categoryId, photoKeys: [photo.key] }),
        })

        expectStatus(res, 200)
        expect(res.data).toMatchObject({
            isBlocked: true,
            blockReason: "Foto non pertinenti",
        })
    })

    it("answers 404 to another Organizer", async () => {
        const owner = await signInAs("organizer")
        const other = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(owner.headers)
        const created = await createEvent({
            headers: owner.headers,
            body: buildEventUpsert({ venueId, categoryId, photoKeys: [photo.key] }),
        })
        expectStatus(created, 201)
        const otherPhoto = await uploadPhoto(other.headers)

        const res = await updateEvent({
            headers: other.headers,
            pathParams: { id: created.data.id },
            body: buildEventUpsert({ venueId, categoryId, photoKeys: [otherPhoto.key] }),
        })

        expectApiError(res, 404, { code: "EventNotFound" })
    })
})
