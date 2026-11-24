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

// Geoapify writes a municipality, and a hamlet with a name of its own, as a `city`
const TOWN_RESULT_TYPE = "city"

/**
 * @description Returns a name in lower case, with no accents and single spaces, so a typed text and a place name compare
 * @param name Name compared
 */
const nameKeyOf = (name: string): string =>
    name
        .normalize("NFD")
        .replaceAll(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim()
        .replaceAll(/\s+/gu, " ")

/**
 * @description Returns the rank of a result for a typed text, lower first: a town of that name, then a town whose name opens with the text, then any other result
 * @param result Result of the Geoapify autocomplete
 * @param textKey Name key of the typed text
 */
const townRankOf = (result: AutocompleteResult, textKey: string): number => {
    if (result.result_type !== TOWN_RESULT_TYPE) {
        return 2
    }
    const nameKey = nameKeyOf(result.address_line1)
    return nameKey === textKey ? 0 : nameKey.startsWith(`${textKey} `) ? 1 : 2
}

/**
 * @description Maps the results of the two Geoapify requests to the suggestions of a text: the towns of that name first, then the places near the center
 * @param text Text typed by the Visitor
 * @param towns Results of the request restricted to towns
 * @param places Results of the request near the center
 */
export const rankedPlacesOf = (
    text: string,
    towns: readonly AutocompleteResult[],
    places: readonly AutocompleteResult[],
): PlaceSuggestion[] => {
    const textKey = nameKeyOf(text)
    return distinctPlacesOf(
        [...towns.filter(town => townRankOf(town, textKey) < 2), ...places].toSorted(
            (first, second) => townRankOf(first, textKey) - townRankOf(second, textKey),
        ),
    ).slice(0, PLACES_PER_SUGGESTION)
}

export class GeoapifyProvider implements GeocodingProvider {
    private readonly baseUrl: string
    private readonly apiKey: string | undefined
    public constructor(config: { baseUrl: string; apiKey: string | undefined }) {
        this.baseUrl = config.baseUrl
        this.apiKey = config.apiKey
    }

    /**
     * @description Fetches the places of the Geoapify autocomplete in the country: the towns named as the text first, then the places nearest to the center
     * @param text Text typed by the Visitor
     * @param area Center the results rank around, the ISO 3166-1 alpha-2 code of the country, and the language of the names
     * @throws When the key is unset, or when Geoapify fails, times out or answers an unknown shape
     */
    public async suggest(
        text: string,
        area: { center: GeoPoint; countryCode: string; language: string },
    ): Promise<PlaceSuggestion[]> {
        const apiKey = this.apiKey
        if (apiKey === undefined) {
            throw appError("GeocodingUnavailable", "GEOAPIFY_API_KEY is unset")
        }
        const { latitude, longitude } = area.center
        const params = {
            text,
            filter: `countrycode:${area.countryCode}`,
            bias: `proximity:${longitude},${latitude}`,
            limit: String(PLACES_PER_SUGGESTION),
            lang: area.language,
            format: "json",
            apiKey,
        }

        try {
            // The bias toward the center buries a far town under the near places of a close
            // name, such as Isola for Imola from Milan, so the towns come from a request of their own
            // A failed town request leaves the near places alone
            const [towns, places] = await Promise.all([
                this.autocomplete({ ...params, type: TOWN_RESULT_TYPE }).catch(
                    (error: unknown) => {
                        logger.warn("Geoapify town autocomplete failed", { error })
                        return []
                    },
                ),
                this.autocomplete(params),
            ])
            return rankedPlacesOf(text, towns, places)
        } catch (error) {
            logger.warn("Geoapify autocomplete failed", { error })
            throw appError(
                "GeocodingUnavailable",
                "The geocoding provider is unavailable",
            )
        }
    }

    /**
     * @description Fetches the results of one request to the Geoapify autocomplete
     * @param params Query parameters of the request
     * @throws When Geoapify answers an error status or an unknown shape
     */
    private async autocomplete(
        params: Record<string, string>,
    ): Promise<AutocompleteResult[]> {
        const url = new URL("/v1/geocode/autocomplete", this.baseUrl)
        url.search = new URLSearchParams(params).toString()
        const response = await fetch(url, {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        })
        if (!response.ok) {
            throw new Error(`Geoapify answered ${String(response.status)}`)
        }
        return autocompleteResponseSchema.parse(await response.json()).results
    }
}
