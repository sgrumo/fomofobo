import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createCategory } from "../backoffice-categories/api"
import { buildCategoryCreation } from "../backoffice-categories/utils"
import { createVenue, getVenue, setVenueKind } from "./api"
import { buildCinemaKind, buildVenueCreation } from "./utils"

describe("PUT /api/backoffice/venues/{id}/kind", () => {
    it("makes a venue a cinema with its programme link and category, then regular again", async () => {
        const { headers } = await signInAs("admin")
        const category = await createCategory({ headers, body: buildCategoryCreation() })
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(category, 201)
        expectStatus(created, 201)
        const cinema = buildCinemaKind(category.data.id)

        const res = await setVenueKind({
            headers,
            pathParams: { id: created.data.id },
            body: cinema,
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({ ...created.data, ...cinema })
        const read = await getVenue({ headers, pathParams: { id: created.data.id } })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(res.data)
        const regular = await setVenueKind({
            headers,
            pathParams: { id: created.data.id },
            body: { kind: "regular" },
        })
        expectStatus(regular, 200)
        expect(regular.data).toStrictEqual(created.data)
    })

    it("answers 409 to a permanent kind for a venue with an owner", async () => {
        const admin = await signInAs("admin")
        const organizer = await signInAs("organizer")
        const category = await createCategory({
            headers: admin.headers,
            body: buildCategoryCreation(),
        })
        const owned = await createVenue({
            headers: organizer.headers,
            body: buildVenueCreation(),
        })
        expectStatus(category, 201)
        expectStatus(owned, 201)

        const res = await setVenueKind({
            headers: admin.headers,
            pathParams: { id: owned.data.id },
            body: buildCinemaKind(category.data.id),
        })

        expectApiError(res, 409, { code: "PermanentVenueOwner" })
    })

    it("answers 400 to an unknown category", async () => {
        const { headers } = await signInAs("admin")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)

        const res = await setVenueKind({
            headers,
            pathParams: { id: created.data.id },
            body: buildCinemaKind(crypto.randomUUID()),
        })

        expectApiError(res, 400, { code: "InvalidVenueCategory" })
    })

    it("answers 404 for an unknown venue", async () => {
        const { headers } = await signInAs("admin")

        const res = await setVenueKind({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: { kind: "regular" },
        })

        expectApiError(res, 404, { code: "VenueNotFound" })
    })

    it("answers 403 to an Organizer", async () => {
        const { headers } = await signInAs("organizer")

        const res = await setVenueKind({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: { kind: "regular" },
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
