import { describe, expect, it, vi } from "vitest"

import type { PurgeDependencies } from "./purge-photos"
import { purgeEndedEventPhotos } from "./purge-photos"

const NOW = new Date("2026-10-24T12:00:00.000Z")

/**
 * @description Builds the row and object deletes, with the row batches answered in order
 * @param batches Object keys of each row batch
 */
const buildDependencies = (batches: string[][]) => {
    const deletePhotosOfEndedEvents =
        vi.fn<PurgeDependencies["deletePhotosOfEndedEvents"]>()
    for (const batch of batches) {
        deletePhotosOfEndedEvents.mockResolvedValueOnce(batch)
    }
    deletePhotosOfEndedEvents.mockResolvedValue([])
    const deleteObject = vi.fn<PurgeDependencies["deleteObject"]>().mockResolvedValue()
    return { deletePhotosOfEndedEvents, deleteObject }
}

/**
 * @description Builds the object keys of one full batch
 * @param prefix Prefix of each key
 */
const fullBatch = (prefix: string) =>
    Array.from({ length: 100 }, (_, index) => `${prefix}-${String(index)}`)

describe("purgeEndedEventPhotos", () => {
    it("should delete the photos of the events ended three days before the run", async () => {
        const dependencies = buildDependencies([["events/a/1", "events/a/2"]])

        const result = await purgeEndedEventPhotos(dependencies, NOW, 3)

        expect(dependencies.deletePhotosOfEndedEvents).toHaveBeenCalledExactlyOnceWith(
            new Date("2026-10-21T12:00:00.000Z"),
            100,
        )
        expect(dependencies.deleteObject.mock.calls).toStrictEqual([
            ["events/a/1"],
            ["events/a/2"],
        ])
        expect(result).toStrictEqual({ deletedCount: 2, failedKeys: [] })
    })

    it("should purge up to the run instant with zero retention days", async () => {
        const dependencies = buildDependencies([])

        await purgeEndedEventPhotos(dependencies, NOW, 0)

        expect(dependencies.deletePhotosOfEndedEvents).toHaveBeenCalledExactlyOnceWith(
            NOW,
            100,
        )
    })

    it("should read another batch while the last one comes back full", async () => {
        const dependencies = buildDependencies([fullBatch("a"), fullBatch("b"), ["c"]])

        const result = await purgeEndedEventPhotos(dependencies, NOW, 3)

        expect(dependencies.deletePhotosOfEndedEvents).toHaveBeenCalledTimes(3)
        expect(result).toStrictEqual({ deletedCount: 201, failedKeys: [] })
    })

    it("should list the key of each object delete that fails, and go on", async () => {
        const dependencies = buildDependencies([["events/a/1", "events/a/2"]])
        dependencies.deleteObject.mockRejectedValueOnce(new Error("Bucket down"))

        const result = await purgeEndedEventPhotos(dependencies, NOW, 3)

        expect(result).toStrictEqual({ deletedCount: 1, failedKeys: ["events/a/1"] })
    })
})
