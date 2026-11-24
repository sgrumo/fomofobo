import "server-only"
import { z } from "@hono/zod-openapi"
import { logger } from "backend-shared"
import { uniq } from "es-toolkit"
import type { GeoPoint, PlaceSuggestion } from "models"
import { isDefined } from "shared/values"

import { appError } from "../errors"

export interface GeocodingProvider {
    suggest: (
        text: string,
        area: { center: GeoPoint; countryCode: string; language: string },
    ) => Promise<PlaceSuggestion[]>
}

const PLACES_PER_SUGGESTION = 5
const REQUEST_TIMEOUT_MS = 3000

// Geoapify writes the region of `formatted` as a code, such as `EMI`, so the texts come from these parts
const autocompleteResultSchema = z.object({
    address_line1: z.string(),
    housenumber: z.string().optional(),
    postcode: z.string().optional(),
    city: z.string().optional(),
    county: z.string().optional(),
    county_code: z.string().optional(),
    state: z.string().optional(),
    lat: z.number(),
    lon: z.number(),
    result_type: z.string().optional(),
})
type AutocompleteResult = z.infer<typeof autocompleteResultSchema>

const autocompleteResponseSchema = z.object({
    results: z.array(autocompleteResultSchema),
})

/**
 * @description Returns the municipality of a result with its province code, else its province, when it differs from the place itself
 * @param result Result of the Geoapify autocomplete
 */
const localityOf = (result: AutocompleteResult): string | undefined => {
    if (result.city !== undefined && result.city !== result.address_line1) {
        // The postcode belongs to a street address alone
        const postcode = result.housenumber === undefined ? undefined : result.postcode
        const province =
            result.county_code === undefined ? undefined : `(${result.county_code})`
        return [postcode, result.city, province].filter(isDefined).join(" ")
    }
    return result.county === result.address_line1 ? undefined : result.county
}

/**
 * @description Maps a result of the Geoapify autocomplete to a suggestion: the label names the place, its municipality and province, and its region in full, the address leaves the region out
 * @param result Result of the Geoapify autocomplete
 */
export const placeSuggestionOf = (result: AutocompleteResult): PlaceSuggestion => {
    const address = uniq([result.address_line1, localityOf(result)].filter(isDefined))
    return {
        label: uniq([...address, result.state].filter(isDefined)).join(", "),
        address: address.join(", "),
        coordinates: { latitude: result.lat, longitude: result.lon },
    }
}

// A province or a region shares its name with its capital, and its center falls outside the town
const AREA_RESULT_TYPES = new Set(["county", "state", "country"])

/**
 * @description Maps the results of the Geoapify autocomplete to suggestions with distinct labels, in the order of the results: of the results that share a label, the place wins over the area
 * @param results Results of the Geoapify autocomplete
 */
export const distinctPlacesOf = (
    results: readonly AutocompleteResult[],
): PlaceSuggestion[] =>
    [
        ...Map.groupBy(
            results.map(result => ({ result, suggestion: placeSuggestionOf(result) })),
            entry => entry.suggestion.label,
        ).values(),
    ]
        .map(
            group =>
                group.find(
                    entry => !AREA_RESULT_TYPES.has(entry.result.result_type ?? ""),
                ) ?? group.at(0),
        )
        .filter(isDefined)
        .map(entry => entry.suggestion)

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
     * @param area Center the results rank around, the ISO 3166-1 alpha-2 code of the country, and the language of the names
     * @throws When the key is unset, or when Geoapify fails, times out or answers an unknown shape
     */
    public async suggest(
        text: string,
        area: { center: GeoPoint; countryCode: string; language: string },
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
            lang: area.language,
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
            return distinctPlacesOf(results)
        } catch (error) {
            logger.warn("Geoapify autocomplete failed", { error })
            throw appError(
                "GeocodingUnavailable",
                "The geocoding provider is unavailable",
            )
        }
    }
}
