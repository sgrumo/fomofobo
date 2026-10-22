import { expectApiError, expectStatus, expectToBeDefined } from "e2e-kit/assertions"
import { anyHttpUrl } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { downloadPhoto, uploadPhoto } from "../backoffice-events/utils"
import { createVenue, getVenue, updateVenue } from "./api"
import { buildVenueCreation, uploadVenueCover } from "./utils"

describe("PATCH /api/backoffice/venues/{id}", () => {
    it("changes the fields that an Admin sends", async () => {
        const { headers } = await signInAs("admin")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)
        const change = {
            name: "Teatro Ebe Stignani",
            coordinates: { latitude: 44.35, longitude: 11.71 },
            description: "Teatro storico del centro.",
            links: {
                websiteUrl: "https://www.teatrostignani.it",
                instagramUrl: "https://www.instagram.com/teatrostignani",
                facebookUrl: null,
            },
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

    it("lets an Organizer edit the venue it owns", async () => {
        const { headers } = await signInAs("organizer")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)

        const res = await updateVenue({
            headers,
            pathParams: { id: created.data.id },
            body: { description: "Musica dal vivo ogni sera." },
        })

        expectStatus(res, 200)
        expect(res.data.description).toBe("Musica dal vivo ogni sera.")
    })

    it("stores a cover uploaded through the ticket, then removes it", async () => {
        const { headers } = await signInAs("organizer")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)
        const cover = await uploadVenueCover(headers, created.data.id)

        const withCover = await updateVenue({
            headers,
            pathParams: { id: created.data.id },
            body: { coverPhotoKey: cover.key },
        })

        expectStatus(withCover, 200)
        const coverUrl = withCover.data.coverPhotoUrl
        expectToBeDefined(coverUrl)
        expect(coverUrl).toStrictEqual(anyHttpUrl)
        expect(await downloadPhoto(coverUrl)).toStrictEqual(cover.bytes)
        const withoutCover = await updateVenue({
            headers,
            pathParams: { id: created.data.id },
            body: { coverPhotoKey: null },
        })
        expectStatus(withoutCover, 200)
        expect(withoutCover.data.coverPhotoUrl).toBeNull()
        expect(await downloadPhoto(coverUrl)).toBeNull()
    })

    it("answers 400 to a cover key outside the uploads of the venue", async () => {
        const { headers } = await signInAs("organizer")
        const created = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(created, 201)
        const eventPhoto = await uploadPhoto(headers)

        const res = await updateVenue({
            headers,
            pathParams: { id: created.data.id },
            body: { coverPhotoKey: eventPhoto.key },
        })

        expectApiError(res, 400, { code: "InvalidPhotoUpload" })
    })

    it("answers 403 to an Organizer on a venue it does not own", async () => {
        const admin = await signInAs("admin")
        const { headers } = await signInAs("organizer")
        const created = await createVenue({
            headers: admin.headers,
            body: buildVenueCreation(),
        })
        expectStatus(created, 201)

        const res = await updateVenue({
            headers,
            pathParams: { id: created.data.id },
            body: { name: "Arena" },
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
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
})
