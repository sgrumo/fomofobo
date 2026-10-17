import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createEvent, deleteEvent, getEvent } from "./api"
import {
    buildEventUpsert,
    downloadPhoto,
    seedEventReferences,
    uploadPhoto,
} from "./utils"

describe("DELETE /api/backoffice/events/{id}", () => {
    it("deletes the event and its photos from the bucket", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(headers)
        const created = await createEvent({
            headers,
            body: buildEventUpsert({ venueId, categoryId, photoKeys: [photo.key] }),
        })
        expectStatus(created, 201)

        const res = await deleteEvent({ headers, pathParams: { id: created.data.id } })

        expectStatus(res, 204)
        expectApiError(
            await getEvent({ headers, pathParams: { id: created.data.id } }),
            404,
            {
                code: "EventNotFound",
            },
        )
        expect(await downloadPhoto(created.data.photos[0]?.url ?? "")).toBeNull()
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

        const res = await deleteEvent({
            headers: other.headers,
            pathParams: { id: created.data.id },
        })

        expectApiError(res, 404, { code: "EventNotFound" })
    })
})
