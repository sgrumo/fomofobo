import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockEvent, createEvent, getEvent } from "./api"
import { buildEventUpsert, seedEventReferences, uploadPhoto } from "./utils"

describe("POST /api/backoffice/events/{id}/block", () => {
    it("blocks the event with its reason, which its Organizer reads", async () => {
        const organizer = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(organizer.headers)
        const created = await createEvent({
            headers: organizer.headers,
            body: buildEventUpsert({ venueId, categoryId, photoKeys: [photo.key] }),
        })
        expectStatus(created, 201)

        const res = await blockEvent({
            headers: admin.headers,
            pathParams: { id: created.data.id },
            body: { reason: "Data errata" },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            ...created.data,
            isBlocked: true,
            blockReason: "Data errata",
            updatedAt: res.data.updatedAt,
        })
        const read = await getEvent({
            headers: organizer.headers,
            pathParams: { id: created.data.id },
        })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(res.data)
    })

    it("answers 403 to an Organizer", async () => {
        const { headers } = await signInAs("organizer")

        const res = await blockEvent({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: { reason: "Spam" },
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })

    it("answers 404 for an unknown event", async () => {
        const { headers } = await signInAs("admin")

        const res = await blockEvent({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: { reason: "Spam" },
        })

        expectApiError(res, 404, { code: "EventNotFound" })
    })
})
