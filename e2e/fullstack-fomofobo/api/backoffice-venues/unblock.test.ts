import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockVenue, createVenue, unblockVenue } from "./api"
import { buildVenueCreation } from "./utils"

describe("POST /api/backoffice/venues/{id}/unblock", () => {
    it("unblocks a venue and clears the reason", async () => {
        const { headers } = await signInAs("admin")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)
        expectStatus(
            await blockVenue({
                headers,
                pathParams: { id: created.data.id },
                body: { reason: "Closed for works" },
            }),
            200,
        )

        const res = await unblockVenue({ headers, pathParams: { id: created.data.id } })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual(created.data)
    })

    it("answers 404 for an unknown venue", async () => {
        const { headers } = await signInAs("admin")

        const res = await unblockVenue({
            headers,
            pathParams: { id: crypto.randomUUID() },
        })

        expectApiError(res, 404, { code: "VenueNotFound" })
    })

    it("answers 403 to an Organizer", async () => {
        const { headers } = await signInAs("organizer")

        const res = await unblockVenue({
            headers,
            pathParams: { id: crypto.randomUUID() },
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
