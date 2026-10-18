import { faker } from "@faker-js/faker"
import type { Page } from "@playwright/test"
import { expectStatus } from "e2e-kit/assertions"
import type { Category, EventUpsert, GeoPoint, Venue } from "models"

import { signInAs } from "../api/auth/utils"
import { createCategory } from "../api/backoffice-categories/api"
import { buildCategoryCreation } from "../api/backoffice-categories/utils"
import { blockEvent } from "../api/backoffice-events/api"
import { seedEvent } from "../api/backoffice-events/utils"
import { createVenue } from "../api/backoffice-venues/api"
import { buildVenueCreation } from "../api/backoffice-venues/utils"
import { SATURDAY_NOON } from "../api/public/utils"

const TEST_NOW_HEADER = "x-test-now"
const EMPTY_TILEJSON = {
    tilejson: "3.0.0",
    tiles: ["https://tiles.openfreemap.org/e2e/{z}/{x}/{y}.pbf"],
    minzoom: 0,
    maxzoom: 14,
    vector_layers: [],
}

/**
 * @description Pins the clock of the browser and of the API to Saturday noon, and keeps
 * the map off the tile provider
 * @param page Page under test
 * @remarks Applies the clock and the routes to the documents loaded after the call only,
 * so it runs before the first navigation
 */
export const preparePublicPage = async (page: Page): Promise<void> => {
    await page.clock.setFixedTime(new Date(SATURDAY_NOON))
    await page.context().setExtraHTTPHeaders({ [TEST_NOW_HEADER]: SATURDAY_NOON })
    await keepMapOffline(page)
}

/**
 * @description Keeps every map of the page off the tile provider: the TileJSON is empty and every tile fails
 * @param page Page under test
 * @remarks Applies to the documents loaded after the call only
 */
export const keepMapOffline = async (page: Page): Promise<void> => {
    await page.context().route("https://tiles.openfreemap.org/**", async route => {
        await (route.request().url().endsWith("/planet")
            ? route.fulfill({ json: EMPTY_TILEJSON })
            : route.abort())
    })
}

/**
 * @description Builds a search center of its own for one test, somewhere in Italy, so the
 * events of two tests never share a search radius
 */
export const buildArea = (): GeoPoint => ({
    latitude: faker.number.float({ min: 38, max: 46, fractionDigits: 3 }),
    longitude: faker.number.float({ min: 8, max: 16, fractionDigits: 3 }),
})

/**
 * @description Returns the point at the offset from the center, in degrees
 * @param center Point moved
 * @param offset Degrees added to the latitude and the longitude
 */
export const offsetPoint = (
    center: GeoPoint,
    offset: { latitude: number; longitude: number },
): GeoPoint => ({
    latitude: center.latitude + offset.latitude,
    longitude: center.longitude + offset.longitude,
})

/**
 * @description Persists a category through an Admin
 */
export const seedCategory = async (): Promise<Category> => {
    const { headers } = await signInAs("admin")
    const category = await createCategory({ headers, body: buildCategoryCreation() })
    expectStatus(category, 201)
    return category.data
}

/**
 * @description Persists a venue at the point through an Admin
 * @param coordinates Coordinates of the venue
 */
export const seedVenue = async (coordinates: GeoPoint): Promise<Venue> => {
    const { headers } = await signInAs("admin")
    const venue = await createVenue({
        headers,
        body: { ...buildVenueCreation(), coordinates },
    })
    expectStatus(venue, 201)
    return venue.data
}

/**
 * @description Persists one event of an Organizer at the venue, in the category
 * @param refs Venue and category of the event
 * @param overrides Fields replaced, such as the title and the times
 */
export const seedPublicEvent = async (
    refs: { venue: Venue; category: Category },
    overrides: Partial<EventUpsert>,
) => {
    const { headers } = await signInAs("organizer")
    return seedEvent(
        headers,
        { venueId: refs.venue.id, categoryId: refs.category.id },
        {
            title: `${faker.music.songName()} ${crypto.randomUUID().slice(0, 8)}`,
            ...overrides,
        },
    )
}

/**
 * @description Blocks the event through an Admin, which hides it from the public app
 * @param eventId Event blocked
 */
export const blockPublicEvent = async (eventId: string): Promise<void> => {
    const { headers } = await signInAs("admin")
    const res = await blockEvent({
        headers,
        pathParams: { id: eventId },
        body: { reason: "Blocked by the E2E suite" },
    })
    expectStatus(res, 200)
}

/**
 * @description Returns the map path centered on the point
 * @param center Search center written in the URL
 */
export const mapPath = (center: GeoPoint): string =>
    `/?lat=${String(center.latitude)}&lng=${String(center.longitude)}`
