import "server-only"
import { SEARCH_RADIUS_METERS } from "domain/platform"
import type { PlaceSearchQuery, SearchSuggestions } from "models"
import { unstable_cache } from "next/cache"
import type { PublicOccurrencesStorage, RateLimitsStorage } from "storage"

import { boundingBox } from "@/lib/geo/bounding-box"

import { PLACES_TAG } from "../cache"
import { appError } from "../errors"
import type { GeocodingProvider } from "../geocoding/geoapify-provider"
import { rateLimitClientOf } from "./rate-limit-client"

const PLACES_CALLS_PER_WINDOW = 30
const PLACES_WINDOW_MS = 60_000
// A bias, not a circle: a far city still shows up, after the nearby matches
const PLACES_COUNTRY_CODE = "it"
const PLACES_CACHE_SECONDS = 86_400
const EVENTS_PER_SUGGESTION = 5
const VENUES_PER_SUGGESTION = 5

export class PlacesService {
    private readonly provider: GeocodingProvider
    private readonly rateLimitsStorage: RateLimitsStorage
    private readonly occurrencesStorage: PublicOccurrencesStorage
    public constructor(
        provider: GeocodingProvider,
        rateLimitsStorage: RateLimitsStorage,
        occurrencesStorage: PublicOccurrencesStorage,
    ) {
        this.provider = provider
        this.rateLimitsStorage = rateLimitsStorage
        this.occurrencesStorage = occurrencesStorage
    }

    /**
     * @description Fetches the places of the country, the nearest to the center first, and the visible events of the area whose title matches the text
     * @param query Text and center of the search field
     * @param forwardedFor `x-forwarded-for` header of the request, which names the client on Vercel
     * @param now Instant of the call
     */
    public async suggest(
        query: PlaceSearchQuery,
        forwardedFor: string | undefined,
        now: Date,
    ): Promise<SearchSuggestions> {
        // PLACEHOLDER(OP-05): places, then the events whose title matches
        const calls = await this.rateLimitsStorage.hit(
            `places:${rateLimitClientOf(forwardedFor)}`,
            now,
            PLACES_WINDOW_MS,
        )
        if (calls > PLACES_CALLS_PER_WINDOW) {
            throw appError("TooManyRequests", "Too many place searches from this client")
        }

        const text = query.q.toLowerCase()
        // Two decimals hold about 1 km, so nearby Visitors share one cached answer
        const cacheCenter = {
            latitude: Math.round(query.lat * 100) / 100,
            longitude: Math.round(query.lng * 100) / 100,
        }
        const center = { latitude: query.lat, longitude: query.lng }
        const area = {
            center,
            radiusMeters: SEARCH_RADIUS_METERS,
            box: boundingBox(center, SEARCH_RADIUS_METERS),
        }
        const [places, events, venues] = await Promise.all([
            unstable_cache(
                async () =>
                    await this.provider.suggest(text, {
                        center: cacheCenter,
                        countryCode: PLACES_COUNTRY_CODE,
                    }),
                [
                    "places",
                    PLACES_COUNTRY_CODE,
                    text,
                    String(cacheCenter.latitude),
                    String(cacheCenter.longitude),
                ],
                { tags: [PLACES_TAG], revalidate: PLACES_CACHE_SECONDS },
            )(),
            this.occurrencesStorage.suggestEvents({
                ...area,
                q: query.q,
                now,
                limit: EVENTS_PER_SUGGESTION,
            }),
            this.occurrencesStorage.suggestVenues({
                ...area,
                q: query.q,
                limit: VENUES_PER_SUGGESTION,
            }),
        ])
        return {
            places,
            events: events.map(event => ({
                eventId: event.eventId,
                date: event.localDate,
                title: event.title,
            })),
            venues,
        }
    }
}
