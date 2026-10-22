import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createVenue, getVenue, setVenueOwner } from "./api"
import { buildVenueCreation } from "./utils"

describe("PUT /api/backoffice/venues/{id}/owner", () => {
    it("gives a venue to an Organizer, then takes it back", async () => {
        const { headers } = await signInAs("admin")
        const organizer = await signInAs("organizer")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)

        const res = await setVenueOwner({
            headers,
            pathParams: { id: created.data.id },
            body: { ownerId: organizer.account.id },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            ...created.data,
            owner: { id: organizer.account.id, name: organizer.account.name },
        })
        const read = await getVenue({ headers, pathParams: { id: created.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(res.data)
        const cleared = await setVenueOwner({
            headers,
            pathParams: { id: created.data.id },
            body: { ownerId: null },
        })
        expectStatus(cleared, 200)
        expect(cleared.data.owner).toBeNull()
    })

    it("answers 409 when the Organizer owns another venue", async () => {
        const { headers } = await signInAs("admin")
        const organizer = await signInAs("organizer")
        const owned = await createVenue({
            headers: organizer.headers,
            body: buildVenueCreation(),
        })
        const other = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(owned, 201)
        expectStatus(other, 201)

        const res = await setVenueOwner({
            headers,
            pathParams: { id: other.data.id },
            body: { ownerId: organizer.account.id },
        })

        expectApiError(res, 409, { code: "VenueOwnerTaken" })
    })

    it("answers 400 to an owner that is not an Organizer", async () => {
        const { account, headers } = await signInAs("admin")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)

        const res = await setVenueOwner({
            headers,
            pathParams: { id: created.data.id },
            body: { ownerId: account.id },
        })

        expectApiError(res, 400, { code: "InvalidVenueOwner" })
    })

    it("answers 404 for an unknown venue", async () => {
        const { headers } = await signInAs("admin")

        const res = await setVenueOwner({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: { ownerId: null },
        })

        expectApiError(res, 404, { code: "VenueNotFound" })
    })

    it("answers 403 to an Organizer", async () => {
        const { account, headers } = await signInAs("organizer")

        const res = await setVenueOwner({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: { ownerId: account.id },
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
