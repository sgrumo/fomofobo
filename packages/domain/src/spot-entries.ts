import type { OccurrenceRef } from "models"
import { match } from "ts-pattern"

export type SpotEntry<TOccurrence, TVenue> =
    | { type: "occurrence"; occurrence: TOccurrence }
    | { type: "venue"; venue: TVenue }

/**
 * @description Returns the entries of one venue among the results: its occurrences in result order, then the venue itself when it is a permanent result
 * @template TOccurrence Occurrence result
 * @template TVenue Permanent venue result
 * @param results Occurrences and permanent venues of a search
 * @param venueId Venue of the spot
 */
export const spotEntriesOf = <
    TOccurrence extends { venue: { id: string } },
    TVenue extends { id: string },
>(
    results: { occurrences: readonly TOccurrence[]; permanentVenues: readonly TVenue[] },
    venueId: string,
): Array<SpotEntry<TOccurrence, TVenue>> => [
    ...results.occurrences
        .filter(occurrence => occurrence.venue.id === venueId)
        .map((occurrence): SpotEntry<TOccurrence, TVenue> => ({
            type: "occurrence",
            occurrence,
        })),
    ...results.permanentVenues
        .filter(venue => venue.id === venueId)
        .map((venue): SpotEntry<TOccurrence, TVenue> => ({ type: "venue", venue })),
]

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
