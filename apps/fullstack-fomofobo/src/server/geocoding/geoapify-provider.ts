import "server-only"
import { z } from "@hono/zod-openapi"
import { logger } from "backend-shared"
import type { GeoPoint, PlaceSuggestion } from "models"

import { appError } from "../errors"

export interface GeocodingProvider {
    suggest: (
        text: string,
        area: { center: GeoPoint; countryCode: string },
    ) => Promise<PlaceSuggestion[]>
}

const PLACES_PER_SUGGESTION = 5
const REQUEST_TIMEOUT_MS = 3000

const autocompleteResponseSchema = z.object({
    results: z.array(
        z.object({ formatted: z.string(), lat: z.number(), lon: z.number() }),
    ),
})

export class GeoapifyProvider implements GeocodingProvider {
    private readonly baseUrl: string
    private readonly apiKey: string | undefined
    public constructor(config: { baseUrl: string; apiKey: string | undefined }) {
        this.baseUrl = config.baseUrl
        this.apiKey = config.apiKey
    }

    /**
     * @description Fetches the places of the Geoapify autocomplete in the country, the nearest to the center first
     * @param text Text typed by the Visitor
     * @param area Center the results rank around, and the ISO 3166-1 alpha-2 code of the country
     * @throws When the key is unset, or when Geoapify fails, times out or answers an unknown shape
     */
    public async suggest(
        text: string,
        area: { center: GeoPoint; countryCode: string },
    ): Promise<PlaceSuggestion[]> {
        if (this.apiKey === undefined) {
            throw appError("GeocodingUnavailable", "GEOAPIFY_API_KEY is unset")
        }
        const { latitude, longitude } = area.center
        const url = new URL("/v1/geocode/autocomplete", this.baseUrl)
        url.search = new URLSearchParams({
            text,
            filter: `countrycode:${area.countryCode}`,
            bias: `proximity:${longitude},${latitude}`,
            limit: String(PLACES_PER_SUGGESTION),
            format: "json",
            apiKey: this.apiKey,
        }).toString()

        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            })
            if (!response.ok) {
                throw new Error(`Geoapify answered ${String(response.status)}`)
            }
            const { results } = autocompleteResponseSchema.parse(await response.json())
            return results.map(result => ({
                label: result.formatted,
                coordinates: { latitude: result.lat, longitude: result.lon },
            }))
        } catch (error) {
            logger.warn("Geoapify autocomplete failed", { error })
            throw appError(
                "GeocodingUnavailable",
                "The geocoding provider is unavailable",
            )
        }
    }
}
