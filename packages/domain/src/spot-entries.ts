import type { GeoPoint, OccurrenceRef } from "models"
import { match } from "ts-pattern"

import { sharedSpotsOf } from "./event-clusters"

export type SpotEntry<TOccurrence, TVenue> =
    | { type: "occurrence"; occurrence: TOccurrence }
    | { type: "venue"; venue: TVenue }

/**
 * @description Returns the entries of the spot of one venue among the results: the occurrences
 * of every venue of the spot in result order, then the permanent venues of the spot
 * @template TOccurrence Occurrence result
 * @template TVenue Permanent venue result
 * @param results Occurrences and permanent venues of a search
 * @param venueId Venue of the spot
 */
export const spotEntriesOf = <
    TOccurrence extends { venue: { id: string; coordinates: GeoPoint } },
    TVenue extends { id: string; coordinates: GeoPoint },
>(
    results: { occurrences: readonly TOccurrence[]; permanentVenues: readonly TVenue[] },
    venueId: string,
): Array<SpotEntry<TOccurrence, TVenue>> => {
    const spotVenueIds = new Set(
        sharedSpotsOf([
            ...results.occurrences.map(occurrence => ({
                venueId: occurrence.venue.id,
                coordinates: occurrence.venue.coordinates,
            })),
            ...results.permanentVenues.map(venue => ({
                venueId: venue.id,
                coordinates: venue.coordinates,
            })),
        ]).find(venueIds => venueIds.includes(venueId)),
    )
    return [
        ...results.occurrences
            .filter(occurrence => spotVenueIds.has(occurrence.venue.id))
            .map((occurrence): SpotEntry<TOccurrence, TVenue> => ({
                type: "occurrence",
                occurrence,
            })),
        ...results.permanentVenues
            .filter(venue => spotVenueIds.has(venue.id))
            .map((venue): SpotEntry<TOccurrence, TVenue> => ({ type: "venue", venue })),
    ]
}

/**
 * @description True when both entries name the same occurrence or the same venue
 * @param entry First entry
 * @param other Second entry, if any
 */
export const isSameSpotEntry = (
    entry: SpotEntry<OccurrenceRef, { id: string }>,
    other: SpotEntry<OccurrenceRef, { id: string }> | undefined,
): boolean =>
    match([entry, other])
        .with(
            [{ type: "occurrence" }, { type: "occurrence" }],
            ([first, second]) =>
                first.occurrence.eventId === second.occurrence.eventId &&
                first.occurrence.date === second.occurrence.date,
        )
        .with(
            [{ type: "venue" }, { type: "venue" }],
            ([first, second]) => first.venue.id === second.venue.id,
        )
        .otherwise(() => false)
