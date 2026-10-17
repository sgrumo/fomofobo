import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { anyUuid } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createVenue, getVenue } from "./api"
import { buildVenueCreation } from "./utils"

describe("POST /api/backoffice/venues", () => {
    it("creates a venue that reads back", async () => {
        const { headers } = await signInAs("organizer")
        const creation = buildVenueCreation()

        const res = await createVenue({ headers, body: creation })

        expectStatus(res, 201)
        expect(res.data).toStrictEqual({ id: anyUuid, ...creation })
        const read = await getVenue({ headers, pathParams: { id: res.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(res.data)
    })

    it("answers 401 without a session", async () => {
        const res = await createVenue({ body: buildVenueCreation() })

        expectApiError(res, 401, { code: "Unauthenticated" })
    })
})
