import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { anyUuid } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createVenue, getVenue } from "./api"
import { buildVenueCreation } from "./utils"

describe("POST /api/backoffice/venues", () => {
    it("creates a venue that its Organizer owns, and that reads back", async () => {
        const { account, headers } = await signInAs("organizer")
        const creation = buildVenueCreation()

        const res = await createVenue({ headers, body: creation })

        expectStatus(res, 201)
        expect(res.data).toStrictEqual({
            id: anyUuid,
            ...creation,
            description: null,
            coverPhotoUrl: null,
            links: { websiteUrl: null, instagramUrl: null, facebookUrl: null },
            owner: { id: account.id, name: account.name },
            isBlocked: false,
            blockReason: null,
        })
        const read = await getVenue({ headers, pathParams: { id: res.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(res.data)
    })

    it("creates a venue with no owner for an Admin, as many as it needs", async () => {
        const { headers } = await signInAs("admin")

        const [first, second] = await Promise.all([
            createVenue({ headers, body: buildVenueCreation() }),
            createVenue({ headers, body: buildVenueCreation() }),
        ])

        expectStatus(first, 201)
        expectStatus(second, 201)
        expect([first.data.owner, second.data.owner]).toStrictEqual([null, null])
    })

    it("answers 409 to an Organizer that already owns a venue", async () => {
        const { headers } = await signInAs("organizer")
        expectStatus(await createVenue({ headers, body: buildVenueCreation() }), 201)

        const res = await createVenue({ headers, body: buildVenueCreation() })

        expectApiError(res, 409, { code: "VenueLimitReached" })
    })

    it("answers 401 without a session", async () => {
        const res = await createVenue({ body: buildVenueCreation() })

        expectApiError(res, 401, { code: "Unauthenticated" })
    })
})
