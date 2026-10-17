import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createEvent, getEvent } from "./api"
import { buildEventUpsert, seedEventReferences, uploadPhoto } from "./utils"

describe("GET /api/backoffice/events/{id}", () => {
    it("answers the event to its Organizer and to an Admin", async () => {
        const organizer = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(organizer.headers)
        const created = await createEvent({
            headers: organizer.headers,
            body: buildEventUpsert({ venueId, categoryId, photoKeys: [photo.key] }),
        })
        expectStatus(created, 201)

        const [own, byAdmin] = await Promise.all([
            getEvent({ headers: organizer.headers, pathParams: { id: created.data.id } }),
            getEvent({ headers: admin.headers, pathParams: { id: created.data.id } }),
        ])

        expectStatus(own, 200)
        expectStatus(byAdmin, 200)
        expect([own.data, byAdmin.data]).toStrictEqual([created.data, created.data])
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

        const res = await getEvent({
            headers: other.headers,
            pathParams: { id: created.data.id },
        })

        expectApiError(res, 404, { code: "EventNotFound" })
    })
})
