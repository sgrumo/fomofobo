import { faker } from "@faker-js/faker"
import type { GeoPoint, VenueCreation } from "models"

/**
 * @description Builds the payload of a venue at the point, or near Imola
 * @param coordinates Point of the venue
 */
export const buildVenueCreation = (
    coordinates: GeoPoint = {
        latitude: faker.number.float({ min: 44.34, max: 44.36, fractionDigits: 5 }),
        longitude: faker.number.float({ min: 11.7, max: 11.72, fractionDigits: 5 }),
    },
): VenueCreation => ({
    name: `${faker.company.name()} ${crypto.randomUUID().slice(0, 8)}`,
    address: faker.location.streetAddress(),
    coordinates,
})
