import { ENDED_OCCURRENCE_VISIBLE_MS } from "models"

const PURGE_BATCH_SIZE = 100

export interface PurgeDependencies {
    deletePhotosOfEndedEvents: (endedBefore: Date, limit: number) => Promise<string[]>
    deleteObject: (key: string) => Promise<void>
}

export interface PurgeResult {
    deletedCount: number
    failedKeys: string[]
}

/**
 * @description Persists the deletion of one batch of photo rows, deletes their objects, and repeats until a batch comes back short
 * @param dependencies Row and object deletes
 * @param endedBefore Instant every occurrence of a purged event ends at or before
 * @param totals Result of the batches before this one
 */
const purgeBatches = async (
    dependencies: PurgeDependencies,
    endedBefore: Date,
    totals: PurgeResult,
): Promise<PurgeResult> => {
    const keys = await dependencies.deletePhotosOfEndedEvents(
        endedBefore,
        PURGE_BATCH_SIZE,
    )
    const results = await Promise.allSettled(
        keys.map(async key => {
            await dependencies.deleteObject(key)
        }),
    )
    const failedKeys = keys.filter((_, index) => results[index]?.status === "rejected")
    const next = {
        deletedCount: totals.deletedCount + keys.length - failedKeys.length,
        failedKeys: [...totals.failedKeys, ...failedKeys],
    }
    return keys.length < PURGE_BATCH_SIZE
        ? next
        : await purgeBatches(dependencies, endedBefore, next)
}

/**
 * @description Deletes the photos of every event that no longer shows in the public app: the rows first, then their objects in the bucket
 * @param dependencies Row and object deletes
 * @param now Instant of the run
 * @remarks Leaves an object whose delete fails in the bucket with no row: the result lists its key
 */
export const purgeEndedEventPhotos = async (
    dependencies: PurgeDependencies,
    now: Date,
): Promise<PurgeResult> =>
    await purgeBatches(
        dependencies,
        new Date(now.getTime() - ENDED_OCCURRENCE_VISIBLE_MS),
        { deletedCount: 0, failedKeys: [] },
    )
