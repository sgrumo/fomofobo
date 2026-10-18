import { occurrenceSummarySchema } from "models"
import type { OccurrenceRef, OccurrenceSummary } from "models"
import { Result } from "shared/result"

const SAVED_SNAPSHOTS_CACHE = "saved-occurrences"

/**
 * @description Returns the cache key of the snapshot of one saved occurrence
 * @param ref Occurrence saved
 */
const snapshotKey = (ref: OccurrenceRef): string =>
    `/saved-occurrences/${ref.eventId}/${ref.date}`

/**
 * @description Returns the snapshot cache, or undefined where the browser has no Cache Storage
 */
const openSnapshots = (): Promise<Cache | undefined> =>
    "caches" in globalThis
        ? caches.open(SAVED_SNAPSHOTS_CACHE)
        : Promise.resolve(undefined)

/**
 * @description Persists one snapshot for each saved occurrence, so the saved screen lists them offline
 * @param occurrences Occurrences saved, as the API last answered them
 */
export const storeSavedSnapshots = async (
    occurrences: OccurrenceSummary[],
): Promise<void> => {
    const cache = await openSnapshots()
    if (cache === undefined) {
        return
    }
    await Promise.all(
        occurrences.map(occurrence =>
            cache.put(snapshotKey(occurrence), Response.json(occurrence)),
        ),
    )
}

/**
 * @description Deletes the snapshot of an occurrence the Visitor no longer saves
 * @param ref Occurrence removed
 */
export const removeSavedSnapshot = async (ref: OccurrenceRef): Promise<void> => {
    const cache = await openSnapshots()
    await cache?.delete(snapshotKey(ref))
}

/**
 * @description Fetches the stored snapshots of the saved occurrences, in the order of the refs, skipping a ref with none
 * @param refs Occurrences saved
 */
export const readSavedSnapshots = async (
    refs: OccurrenceRef[],
): Promise<OccurrenceSummary[]> => {
    const cache = await openSnapshots()
    const snapshots = await Promise.all(
        refs.map(async ref => {
            const response = await cache?.match(snapshotKey(ref))
            if (response === undefined) {
                return []
            }
            const body = await Result.tryAsync((): Promise<unknown> => response.json())
            const parsed = occurrenceSummarySchema.safeParse(
                body.success ? body.value : undefined,
            )
            return parsed.success ? [parsed.data] : []
        }),
    )
    return snapshots.flat()
}
