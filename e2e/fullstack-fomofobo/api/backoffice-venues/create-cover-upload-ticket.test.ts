import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { anyHttpUrl } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createVenue, createVenueCoverUploadTicket } from "./api"
import { buildVenueCreation } from "./utils"

const coverRequest = {
    fileName: "cover.png",
    contentType: "image/png",
    sizeBytes: 128,
} as const

describe("POST /api/backoffice/venues/{id}/cover/upload-ticket", () => {
    it("answers a presigned PUT under a key of the venue to its owner", async () => {
        const { headers } = await signInAs("organizer")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)

        const res = await createVenueCoverUploadTicket({
            headers,
            pathParams: { id: created.data.id },
            body: coverRequest,
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            url: anyHttpUrl,
            headers: { "Content-Type": "image/png" },
            key: expect.stringMatching(
                new RegExp(`^venues/${created.data.id}/[0-9a-f-]{36}$`, "u"),
            ),
        })
    })

    it("answers 403 to an Organizer on a venue it does not own", async () => {
        const admin = await signInAs("admin")
        const { headers } = await signInAs("organizer")
        const created = await createVenue({
            headers: admin.headers,
            body: buildVenueCreation(),
        })
        expectStatus(created, 201)

        const res = await createVenueCoverUploadTicket({
            headers,
            pathParams: { id: created.data.id },
            body: coverRequest,
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })

    it("answers 404 for an unknown venue", async () => {
        const { headers } = await signInAs("admin")

        const res = await createVenueCoverUploadTicket({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: coverRequest,
        })

        expectApiError(res, 404, { code: "VenueNotFound" })
    })
})
