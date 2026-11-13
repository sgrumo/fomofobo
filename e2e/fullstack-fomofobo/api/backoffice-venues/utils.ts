import { faker } from "@faker-js/faker"
import { expectRawStatus, expectStatus } from "e2e-kit/assertions"
import type {
    PermanentVenueKind,
    PermanentVenueKindChange,
    Venue,
    VenueCreation,
} from "models"

import { signInAs } from "../auth/utils"
import { createVenue, createVenueCoverUploadTicket, setVenueKind } from "./api"

/**
 * @description Builds the payload of a venue near Imola with a unique name
 */
export const buildVenueCreation = (): VenueCreation => ({
    name: `${faker.company.name()} ${crypto.randomUUID().slice(0, 8)}`,
    address: faker.location.streetAddress(),
    coordinates: {
        latitude: faker.number.float({ min: 44.34, max: 44.36, fractionDigits: 5 }),
        longitude: faker.number.float({ min: 11.7, max: 11.72, fractionDigits: 5 }),
    },
})

/**
 * @description Builds the payload of a cinema kind with a programme link and a Monday closing,
 * in the category
 * @param categoryId Category the cinema matches
 */
export const buildCinemaKind = (categoryId: string): PermanentVenueKindChange => ({
    kind: "cinema",
    programmeUrl: `https://www.cinema-imola.it/programmazione/${crypto.randomUUID()}`,
    categoryId,
    closingDays: ["monday"],
})

/**
 * @description Persists a venue through an Admin and gives it a permanent kind in the category
 * @param categoryId Category the venue matches
 * @param kind Permanent kind given
 * @param overrides Fields of the creation replaced, such as the name and the coordinates
 */
export const seedPermanentVenue = async (
    categoryId: string,
    kind: PermanentVenueKind,
    overrides: Partial<VenueCreation> = {},
): Promise<Venue> => {
    const { headers } = await signInAs("admin")
    const created = await createVenue({
        headers,
        body: { ...buildVenueCreation(), ...overrides },
    })
    expectStatus(created, 201)
    const permanent = await setVenueKind({
        headers,
        pathParams: { id: created.data.id },
        body: { ...buildCinemaKind(categoryId), kind },
    })
    expectStatus(permanent, 200)
    return permanent.data
}

/**
 * @description Persists a venue through an Admin and makes it a cinema in the category
 * @param categoryId Category the cinema matches
 * @param overrides Fields of the creation replaced, such as the name and the coordinates
 */
export const seedCinema = (
    categoryId: string,
    overrides: Partial<VenueCreation> = {},
): Promise<Venue> => seedPermanentVenue(categoryId, "cinema", overrides)

/**
 * @description Uploads random bytes through a cover ticket of the venue, and returns the key and the bytes
 * @param headers Headers of a session that may edit the venue
 * @param venueId Venue whose cover is uploaded
 */
export const uploadVenueCover = async (
    headers: { Cookie: string },
    venueId: string,
): Promise<{ key: string; bytes: Uint8Array }> => {
    const bytes = crypto.getRandomValues(new Uint8Array(256))
    const ticket = await createVenueCoverUploadTicket({
        headers,
        pathParams: { id: venueId },
        body: {
            fileName: "cover.png",
            contentType: "image/png",
            sizeBytes: bytes.byteLength,
        },
    })
    expectStatus(ticket, 200)
    const upload = await fetch(ticket.data.url, {
        method: "PUT",
        headers: ticket.data.headers,
        body: bytes,
    })
    expectRawStatus(upload, 200)
    return { key: ticket.data.key, bytes }
}
