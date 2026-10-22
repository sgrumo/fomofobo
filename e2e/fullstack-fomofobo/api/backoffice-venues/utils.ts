import { faker } from "@faker-js/faker"
import type { VenueCreation, VenueKindChange } from "models"

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
export const buildCinemaKind = (categoryId: string): VenueKindChange => ({
    kind: "cinema",
    programmeUrl: `https://www.cinema-imola.it/programmazione/${crypto.randomUUID()}`,
    categoryId,
})
