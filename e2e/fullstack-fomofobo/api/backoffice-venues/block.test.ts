import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockVenue, createVenue, getVenue } from "./api"
import { buildVenueCreation } from "./utils"

describe("POST /api/backoffice/venues/{id}/block", () => {
    it("blocks a venue with the reason", async () => {
        const { headers } = await signInAs("admin")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)

        const res = await blockVenue({
            headers,
            pathParams: { id: created.data.id },
            body: { reason: "Closed for works" },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            ...created.data,
            isBlocked: true,
            blockReason: "Closed for works",
        })
        const read = await getVenue({ headers, pathParams: { id: created.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(res.data)
    })

    it("answers 404 for an unknown venue", async () => {
        const { headers } = await signInAs("admin")

        const res = await blockVenue({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: { reason: "Closed" },
        })

        expectApiError(res, 404, { code: "VenueNotFound" })
    })

    it("answers 403 to an Organizer", async () => {
        const { headers } = await signInAs("organizer")

        const res = await blockVenue({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: { reason: "Closed" },
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
