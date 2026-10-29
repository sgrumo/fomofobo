import { partition } from "es-toolkit"
import type { PlaceSuggestion, SearchSuggestions } from "models"

import { centerQueryOf } from "./map-center"
import type { MapQuery } from "./map-query"

export const MIN_SUGGESTION_TEXT = 2

export const SUGGESTION_DELAY_MS = 300

type VenueSuggestion = SearchSuggestions["venues"][number]

interface VenueSuggestionGroups {
    regular: VenueSuggestion[]
    permanent: VenueSuggestion[]
}

/**
 * @description Returns the map query change that centers the search on a place suggestion and
 * clears the text search
 * @param place Place picked
 */
export const placeQueryOf = (place: PlaceSuggestion): MapQuery => ({
    ...centerQueryOf(place.coordinates),
    place: place.label,
    q: undefined,
})

/**
 * @description Returns the map query change of a submitted or cleared search text, which clears
 * the place
 * @param text Text of the field, blank when cleared
 */
export const textQueryOf = (text: string): MapQuery => {
    const trimmed = text.trim()
    return { q: trimmed === "" ? undefined : trimmed, place: undefined }
}

/**
 * @description Returns the place that a submitted text picks: the first place suggestion of the
 * text when no event or venue matches it, else undefined for a text search
 * @param text Submitted text
 * @param suggestedText Text of the suggestions
 * @param suggestions Suggestions of the suggested text, undefined until they load
 */
export const submittedPlaceOf = (
    text: string,
    suggestedText: string,
    suggestions: SearchSuggestions | undefined,
): PlaceSuggestion | undefined =>
    suggestions === undefined ||
    text.trim() !== suggestedText ||
    suggestions.events.length > 0 ||
    suggestions.venues.length > 0
        ? undefined
        : suggestions.places.at(0)

/**
 * @description Returns the venue suggestions split into regular venues and permanent venues
 * @param venues Venue suggestions of the search field
 */
export const venueSuggestionGroupsOf = (
    venues: readonly VenueSuggestion[],
): VenueSuggestionGroups => {
    const [regular, permanent] = partition(venues, venue => venue.kind === "regular")
    return { regular, permanent }
}

/**
 * @description True when the suggestions hold no place, event or venue
 * @param suggestions Suggestions of the search field
 */
export const isEmptySuggestions = (suggestions: SearchSuggestions): boolean =>
    suggestions.places.length === 0 &&
    suggestions.events.length === 0 &&
    suggestions.venues.length === 0
