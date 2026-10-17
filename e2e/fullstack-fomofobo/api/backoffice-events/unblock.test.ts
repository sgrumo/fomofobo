import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockEvent, createEvent, unblockEvent } from "./api"
import { buildEventUpsert, seedEventReferences, uploadPhoto } from "./utils"

describe("POST /api/backoffice/events/{id}/unblock", () => {
    it("unblocks the event and clears the reason", async () => {
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
                body: { reason: "Data errata" },
            }),
            200,
        )

        const res = await unblockEvent({
            headers: admin.headers,
            pathParams: { id: created.data.id },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({ ...created.data, updatedAt: res.data.updatedAt })
    })

    it("answers 404 for an unknown event", async () => {
        const { headers } = await signInAs("admin")

        const res = await unblockEvent({
            headers,
            pathParams: { id: crypto.randomUUID() },
        })

        expectApiError(res, 404, { code: "EventNotFound" })
    })
})
