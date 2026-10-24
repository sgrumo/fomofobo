import { createWebStorage, storagePrefix } from "frontend-shared/storage"
import type { SaveChange } from "models"
import { describe, expect, it, vi } from "vitest"

import { ApiResponseError } from "../api/api-response-error"
import { createMirroredStorage } from "../storage/mirrored-storage"
import { deviceStorageDefaults, deviceStorageSchema } from "../storage/storage-keys"
import { createSaveSync } from "./save-sync"

const concert = { eventId: "7d0c1c3e-5f0a-4f39-9b8e-2f5b9f3d6a10", date: "2026-10-24" }
const market = { eventId: "0b3e9a4d-8c21-4c6f-a1f7-6e2d5c4b3a29", date: "2026-10-25" }
const deviceId = "5f1c2b7e-3a4d-4e6f-9a8b-1c2d3e4f5a6b"

/**
 * @description Builds a device storage held in memory, with no persistent store behind it
 */
const createTestStorage = () =>
    createWebStorage(
        createMirroredStorage({
            getAllKeys: () => Promise.resolve([]),
            multiGet: () => Promise.resolve([]),
            setItem: () => Promise.resolve(),
            removeItem: () => Promise.resolve(),
        }).storage,
        deviceStorageSchema,
        deviceStorageDefaults,
        storagePrefix,
    )

/**
 * @description Builds an API refusal with the given status
 * @param status HTTP status of the refusal
 */
const refusal = (status: number) =>
    new ApiResponseError(`PUT /saves failed (${status})`, { status, apiError: undefined })

describe("createSaveSync", () => {
    it("sends the queued changes in order and empties the queue", async () => {
        const storage = createTestStorage()
        const send = vi.fn<(change: SaveChange, id: string) => Promise<unknown>>(() =>
            Promise.resolve(),
        )
        const sync = createSaveSync({ storage, send, randomId: () => deviceId })

        await Promise.all([
            sync.syncSaveChange({ ...concert, action: "save" }),
            sync.syncSaveChange({ ...market, action: "save" }),
        ])

        expect(send.mock.calls).toStrictEqual([
            [{ ...concert, action: "save" }, deviceId],
            [{ ...market, action: "save" }, deviceId],
        ])
        expect(storage.getItem("save-sync").pending).toStrictEqual([])
    })

    it("drops a change refused for good and sends the next one", async () => {
        const storage = createTestStorage()
        const send = vi
            .fn<(change: SaveChange, id: string) => Promise<unknown>>()
            .mockRejectedValueOnce(refusal(404))
            .mockResolvedValue(undefined)
        const sync = createSaveSync({ storage, send, randomId: () => deviceId })
        storage.setItem("save-sync", {
            version: 1,
            queuedStoredSaves: true,
            pending: [
                { ...concert, action: "save" },
                { ...market, action: "unsave" },
            ],
        })

        await sync.flushSaveChanges()

        expect(send).toHaveBeenCalledTimes(2)
        expect(storage.getItem("save-sync").pending).toStrictEqual([])
    })

    it.each([
        { reason: "a rate limit", failure: refusal(429) },
        { reason: "a server error", failure: refusal(503) },
        { reason: "a network failure", failure: new TypeError("Network request failed") },
    ])("keeps the queue and stops on $reason", async ({ failure }) => {
        const storage = createTestStorage()
        const send = vi
            .fn<(change: SaveChange, id: string) => Promise<unknown>>()
            .mockRejectedValue(failure)
        const sync = createSaveSync({ storage, send, randomId: () => deviceId })
        const pending: SaveChange[] = [
            { ...concert, action: "save" },
            { ...market, action: "save" },
        ]
        storage.setItem("save-sync", { version: 1, queuedStoredSaves: true, pending })

        await sync.flushSaveChanges()

        expect(send).toHaveBeenCalledOnce()
        expect(storage.getItem("save-sync").pending).toStrictEqual(pending)
    })

    it("creates the device id on the first send and reuses it", async () => {
        const storage = createTestStorage()
        const send = vi.fn<(change: SaveChange, id: string) => Promise<unknown>>(() =>
            Promise.resolve(),
        )
        const randomId = vi.fn<() => string>(() => deviceId)
        const sync = createSaveSync({ storage, send, randomId })

        expect(storage.getItem("device-id")).toBeNull()
        await sync.syncSaveChange({ ...concert, action: "save" })
        await sync.syncSaveChange({ ...concert, action: "unsave" })

        expect(randomId).toHaveBeenCalledOnce()
        expect(storage.getItem("device-id")).toBe(deviceId)
        expect(send.mock.calls.map(([, id]) => id)).toStrictEqual([deviceId, deviceId])
    })

    it("queues the stored saves on the first start only", async () => {
        const storage = createTestStorage()
        const send = vi.fn<(change: SaveChange, id: string) => Promise<unknown>>(() =>
            Promise.resolve(),
        )
        const sync = createSaveSync({ storage, send, randomId: () => deviceId })
        storage.setItem("saved-events", {
            version: 1,
            events: [{ ...concert, savedAt: "2026-10-20T10:00:00.000Z" }],
        })

        await sync.startSaveSync()
        await sync.startSaveSync()

        expect(send.mock.calls).toStrictEqual([
            [{ ...concert, action: "save" }, deviceId],
        ])
        expect(storage.getItem("save-sync").queuedStoredSaves).toBe(true)
    })
})
