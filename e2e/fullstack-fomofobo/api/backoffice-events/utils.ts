import { faker } from "@faker-js/faker"
import { expectRawStatus, expectStatus } from "e2e-kit/assertions"
import type { Event, EventUpsert, PhotoContentType, Recurrence, Venue } from "models"

import { signInAs } from "../auth/utils"
import { createCategory } from "../backoffice-categories/api"
import { buildCategoryCreation } from "../backoffice-categories/utils"
import { createVenue } from "../backoffice-venues/api"
import { buildVenueCreation } from "../backoffice-venues/utils"
import { createEvent, createPhotoUploadTicket } from "./api"

/**
 * @description Builds the payload of a single event, 21:00 to 23:30 on the day, with the overrides
 * @param refs Venue, primary category and photo keys of the event
 * @param overrides Fields replaced
 */
export const buildEventUpsert = (
    refs: { venueId: string; categoryId: string; photoKeys: string[] },
    overrides: Partial<EventUpsert> = {},
): EventUpsert => ({
    title: `${faker.music.songName()} live`,
    description: faker.lorem.sentence(),
    categoryIds: [refs.categoryId],
    primaryCategoryId: refs.categoryId,
    venueId: refs.venueId,
    startsAt: "2026-10-24T21:00",
    endsAt: "2026-10-24T23:30",
    recurrence: null,
    photoKeys: refs.photoKeys,
    externalLinks: {
        instagramUrl: "https://www.instagram.com/fomofobo",
        facebookUrl: null,
    },
    price: "10 €",
    ...overrides,
})

/**
 * @description Builds a weekly recurrence on Saturdays up to the date
 * @param until Last day of the rule
 */
export const buildWeeklyRecurrence = (until: string): Recurrence => ({
    rule: { frequency: "weekly", weekdays: ["saturday"], until },
    addedDates: [],
    removedDates: [],
})

/**
 * @description Persists a category and a venue through an Admin, for the events of a test
 */
export const seedEventReferences = async (): Promise<{
    categoryId: string
    venueId: string
    venue: Venue
}> => {
    const { headers } = await signInAs("admin")
    const category = await createCategory({ headers, body: buildCategoryCreation() })
    const venue = await createVenue({ headers, body: buildVenueCreation() })
    expectStatus(category, 201)
    expectStatus(venue, 201)
    return { categoryId: category.data.id, venueId: venue.data.id, venue: venue.data }
}

/**
 * @description Uploads random bytes through a photo upload ticket of the session, and returns the key and the bytes
 * @param headers Headers of the session that uploads
 * @param contentType Type of the photo
 */
export const uploadPhoto = async (
    headers: { Cookie: string },
    contentType: PhotoContentType = "image/png",
): Promise<{ key: string; bytes: Uint8Array }> => {
    const bytes = crypto.getRandomValues(new Uint8Array(256))
    const ticket = await createPhotoUploadTicket({
        headers,
        body: { fileName: "photo.png", contentType, sizeBytes: bytes.byteLength },
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

/**
 * @description Fetches the bytes behind a public photo URL, or `null` when it does not answer `200`
 * @param url Public URL of the photo
 */
export const downloadPhoto = async (url: string): Promise<Uint8Array | null> => {
    const response = await fetch(url)
    return response.status === 200 ? new Uint8Array(await response.arrayBuffer()) : null
}

/**
 * @description Uploads a photo and persists an event of the session with it, and returns the event
 * @param headers Headers of the session that writes
 * @param refs Venue and primary category of the event
 * @param overrides Fields replaced
 */
export const seedEvent = async (
    headers: { Cookie: string },
    refs: { venueId: string; categoryId: string },
    overrides: Partial<EventUpsert> = {},
): Promise<Event> => {
    const photo = await uploadPhoto(headers)
    const res = await createEvent({
        headers,
        body: buildEventUpsert({ ...refs, photoKeys: [photo.key] }, overrides),
    })
    expectStatus(res, 201)
    return res.data
}
