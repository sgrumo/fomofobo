import { faker } from "@faker-js/faker"
import { expectStatus } from "e2e-kit/assertions"
import type { PermanentVenueKindChange, Venue, VenueCreation } from "models"

import { signInAs } from "../auth/utils"
import { createVenue, setVenueKind } from "./api"

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
 * @description Builds the payload of a cinema kind with a programme link, in the category
 * @param categoryId Category the cinema matches
 */
export const buildCinemaKind = (categoryId: string): PermanentVenueKindChange => ({
    kind: "cinema",
    programmeUrl: `https://www.cinema-imola.it/programmazione/${crypto.randomUUID()}`,
    categoryId,
})

/**
 * @description Persists a venue through an Admin and makes it a cinema in the category
 * @param categoryId Category the cinema matches
 * @param overrides Fields of the creation replaced, such as the name and the coordinates
 */
export const seedCinema = async (
    categoryId: string,
    overrides: Partial<VenueCreation> = {},
): Promise<Venue> => {
    const { headers } = await signInAs("admin")
    const created = await createVenue({
        headers,
        body: { ...buildVenueCreation(), ...overrides },
    })
    expectStatus(created, 201)
    const cinema = await setVenueKind({
        headers,
        pathParams: { id: created.data.id },
        body: buildCinemaKind(categoryId),
    })
    expectStatus(cinema, 200)
    return cinema.data
}
