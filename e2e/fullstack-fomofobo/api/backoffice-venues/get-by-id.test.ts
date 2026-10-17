import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createVenue, getVenue } from "./api"
import { buildVenueCreation } from "./utils"

describe("GET /api/backoffice/venues/{id}", () => {
    it("answers a venue that another account created", async () => {
        const admin = await signInAs("admin")
        const organizer = await signInAs("organizer")
        const created = await createVenue({
            headers: admin.headers,
            body: buildVenueCreation(),
        })
        expectStatus(created, 201)

        const res = await getVenue({
            headers: organizer.headers,
            pathParams: { id: created.data.id },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual(created.data)
    })

    it("answers 404 for an unknown venue", async () => {
        const { headers } = await signInAs("organizer")

        const res = await getVenue({ headers, pathParams: { id: crypto.randomUUID() } })

        expectApiError(res, 404, { code: "VenueNotFound" })
    })
})
