import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { anyHttpUrl, anyIsoDateTime, anyUuid } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createCategory } from "../backoffice-categories/api"
import { buildCategoryCreation } from "../backoffice-categories/utils"
import { createEvent, getEvent } from "./api"
import {
    buildEventUpsert,
    buildWeeklyRecurrence,
    downloadPhoto,
    seedEventReferences,
    uploadPhoto,
} from "./utils"

describe("POST /api/backoffice/events", () => {
    it("creates the event of the Organizer with its categories and its uploaded photo", async () => {
        const { account, headers } = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const admin = await signInAs("admin")
        const second = await createCategory({
            headers: admin.headers,
            body: buildCategoryCreation(),
        })
        expectStatus(second, 201)
        const photo = await uploadPhoto(headers)
        const upsert = buildEventUpsert(
            { venueId, categoryId, photoKeys: [photo.key] },
            { categoryIds: [second.data.id, categoryId] },
        )

        const res = await createEvent({ headers, body: upsert })

        expectStatus(res, 201)
        expect(res.data).toStrictEqual({
            id: anyUuid,
            title: upsert.title,
            description: upsert.description,
            categoryIds: expect.arrayContaining([categoryId, second.data.id]),
            primaryCategoryId: categoryId,
            venue,
            startsAt: upsert.startsAt,
            endsAt: upsert.endsAt,
            recurrence: null,
            photos: [{ id: anyUuid, url: anyHttpUrl, position: 0 }],
            externalLinks: upsert.externalLinks,
            price: upsert.price,
            organizer: { id: account.id, name: account.name },
            isBlocked: false,
            blockReason: null,
            createdAt: anyIsoDateTime,
            updatedAt: anyIsoDateTime,
        })
        expect(res.data.categoryIds).toHaveLength(2)
        const read = await getEvent({ headers, pathParams: { id: res.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(res.data)
        expect(await downloadPhoto(res.data.photos[0]?.url ?? "")).toStrictEqual(
            photo.bytes,
        )
    })

    it("creates the event of an Organizer that an Admin picks", async () => {
        const admin = await signInAs("admin")
        const organizer = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(admin.headers)

        const res = await createEvent({
            headers: admin.headers,
            body: buildEventUpsert(
                { venueId, categoryId, photoKeys: [photo.key] },
                { organizerId: organizer.account.id },
            ),
        })

        expectStatus(res, 201)
        expect(res.data.organizer).toStrictEqual({
            id: organizer.account.id,
            name: organizer.account.name,
        })
    })

    it("answers 403 when an Organizer picks the organizer", async () => {
        const { account, headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(headers)

        const res = await createEvent({
            headers,
            body: buildEventUpsert(
                { venueId, categoryId, photoKeys: [photo.key] },
                { organizerId: account.id },
            ),
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })

    it("answers 400 when an Admin picks no organizer, or an Admin as the organizer", async () => {
        const { account, headers } = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(headers)
        const refs = { venueId, categoryId, photoKeys: [photo.key] }

        const missing = await createEvent({ headers, body: buildEventUpsert(refs) })
        const admin = await createEvent({
            headers,
            body: buildEventUpsert(refs, { organizerId: account.id }),
        })

        expectApiError(missing, 400, { code: "InvalidEventReference" })
        expectApiError(admin, 400, { code: "InvalidEventReference" })
    })

    it("answers 400 for an unknown venue or category", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(headers)

        const venue = await createEvent({
            headers,
            body: buildEventUpsert({
                venueId: crypto.randomUUID(),
                categoryId,
                photoKeys: [photo.key],
            }),
        })
        const category = await createEvent({
            headers,
            body: buildEventUpsert({
                venueId,
                categoryId: crypto.randomUUID(),
                photoKeys: [photo.key],
            }),
        })

        expectApiError(venue, 400, { code: "InvalidEventReference" })
        expectApiError(category, 400, { code: "InvalidEventReference" })
    })

    it("answers 400 for a photo key of another account or a key never uploaded", async () => {
        const { account, headers } = await signInAs("organizer")
        const other = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const othersPhoto = await uploadPhoto(other.headers)

        const foreign = await createEvent({
            headers,
            body: buildEventUpsert({ venueId, categoryId, photoKeys: [othersPhoto.key] }),
        })
        const missing = await createEvent({
            headers,
            body: buildEventUpsert({
                venueId,
                categoryId,
                photoKeys: [`events/${account.id}/${crypto.randomUUID()}`],
            }),
        })

        expectApiError(foreign, 400, { code: "InvalidPhotoUpload" })
        expectApiError(missing, 400, { code: "InvalidPhotoUpload" })
    })

    it("answers 400 for a photo that another event already holds", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(headers)
        const refs = { venueId, categoryId, photoKeys: [photo.key] }
        expectStatus(await createEvent({ headers, body: buildEventUpsert(refs) }), 201)

        const res = await createEvent({ headers, body: buildEventUpsert(refs) })

        expectApiError(res, 400, { code: "InvalidPhotoUpload" })
    })

    it("answers 400 when the recurrence yields more occurrences than an event holds", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(headers)

        const res = await createEvent({
            headers,
            body: buildEventUpsert(
                { venueId, categoryId, photoKeys: [photo.key] },
                { recurrence: buildWeeklyRecurrence("2040-12-31") },
            ),
        })

        expectApiError(res, 400, { code: "TooManyOccurrences" })
    })
})
