import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createVenue, getVenue, updateVenue } from "./api"
import { buildVenueCreation } from "./utils"

describe("PATCH /api/backoffice/venues/{id}", () => {
    it("changes the fields that an Admin sends", async () => {
        const { headers } = await signInAs("admin")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)
        const change = {
            name: "Teatro Ebe Stignani",
            coordinates: { latitude: 44.35, longitude: 11.71 },
        }

        const res = await updateVenue({
            headers,
            pathParams: { id: created.data.id },
            body: change,
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({ ...created.data, ...change })
        const read = await getVenue({ headers, pathParams: { id: created.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(res.data)
    })

    it("answers 404 for an unknown venue", async () => {
        const { headers } = await signInAs("admin")

        const res = await updateVenue({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: { name: "Arena" },
        })

        expectApiError(res, 404, { code: "VenueNotFound" })
    })

    it("answers 403 to an Organizer, even on its own venue", async () => {
        const { headers } = await signInAs("organizer")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)

        const res = await updateVenue({
            headers,
            pathParams: { id: created.data.id },
            body: { name: "Arena" },
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
