import {
    dropSentSaveChange,
    isFinalSaveRefusal,
    queueSaveChange,
} from "domain/save-queue"
import type { WebStorage } from "frontend-shared/storage"
import type { SaveChange } from "models"

import type { DeviceStorageKey, deviceStorageSchema } from "@/lib/storage/storage-keys"

import { ApiResponseError } from "../api/api-response-error"

interface SaveSyncOptions {
    storage: WebStorage<DeviceStorageKey, typeof deviceStorageSchema>
    send: (change: SaveChange, deviceId: string) => Promise<unknown>
    randomId: () => string
}

/**
 * @description Builds the sync that sends each save and unsave of the device to the API, through a queue kept in the storage
 * @param options Storage of the queue, sender of one change, and source of the device id
 */
export const createSaveSync = (options: SaveSyncOptions) => {
    const storage = options.storage

    const deviceId = (): string => {
        const stored = storage.getItem("device-id")
        if (stored !== null) {
            return stored
        }
        const created = options.randomId()
        storage.setItem("device-id", created)
        return created
    }

    const sendSaveChange = async (change: SaveChange): Promise<boolean> => {
        try {
            await options.send(change, deviceId())
            return true
        } catch (error) {
            return error instanceof ApiResponseError && isFinalSaveRefusal(error.status)
        }
    }

    const sendQueue = async (): Promise<void> => {
        const next = storage.getItem("save-sync").pending.at(0)
        if (next === undefined || !(await sendSaveChange(next))) {
            return
        }
        const sync = storage.getItem("save-sync")
        storage.setItem("save-sync", {
            ...sync,
            pending: dropSentSaveChange(sync.pending, next),
        })
        await sendQueue()
    }

    // One run at a time: a second run would send each change twice.
    let running: Promise<void> | undefined = undefined

    const flushSaveChanges = (): Promise<void> => {
        running ??= sendQueue().finally(() => {
            running = undefined
        })
        return running
    }

    const syncSaveChange = (change: SaveChange): Promise<void> => {
        const sync = storage.getItem("save-sync")
        storage.setItem("save-sync", {
            ...sync,
            pending: queueSaveChange(sync.pending, change),
        })
        return flushSaveChanges()
    }

    const startSaveSync = (): Promise<void> => {
        const sync = storage.getItem("save-sync")
        if (!sync.queuedStoredSaves) {
            storage.setItem("save-sync", {
                ...sync,
                queuedStoredSaves: true,
                pending: storage.getItem("saved-events").events.reduce(
                    (pending, saved) =>
                        queueSaveChange(pending, {
                            eventId: saved.eventId,
                            date: saved.date,
                            action: "save",
                        }),
                    sync.pending,
                ),
            })
        }
        return flushSaveChanges()
    }

    return { flushSaveChanges, syncSaveChange, startSaveSync }
}
