import {
    dropSentSaveChange,
    isFinalSaveRefusal,
    queueSaveChange,
} from "domain/save-queue"
import type { SaveChange } from "models"

import { api } from "@/lib/api/client-api"
import { ApiTransportError } from "@/lib/api/transport-error"
import { localStorage } from "@/lib/storage/local-storage"

/**
 * @description Returns the id of this device, created and persisted on the first call
 */
const deviceId = (): string => {
    const stored = localStorage.getItem("device-id")
    if (stored !== null) {
        return stored
    }
    const created = crypto.randomUUID()
    localStorage.setItem("device-id", created)
    return created
}

/**
 * @description Sends one change, and returns true when it leaves the queue
 * @param change Change to send
 */
const sendSaveChange = async (change: SaveChange): Promise<boolean> => {
    const request = {
        params: { eventId: change.eventId, date: change.date },
        body: { deviceId: deviceId() },
    }
    try {
        await (change.action === "save"
            ? api.saveOccurrence(request)
            : api.unsaveOccurrence(request))
        return true
    } catch (error) {
        return error instanceof ApiTransportError && isFinalSaveRefusal(error.status)
    }
}

/**
 * @description Sends the queued changes in order, until the queue is empty or a send fails
 */
const sendQueue = async (): Promise<void> => {
    const next = localStorage.getItem("save-sync").pending.at(0)
    if (next === undefined || !(await sendSaveChange(next))) {
        return
    }
    const sync = localStorage.getItem("save-sync")
    localStorage.setItem("save-sync", {
        ...sync,
        pending: dropSentSaveChange(sync.pending, next),
    })
    await sendQueue()
}

// One run at a time: a second run would send each change twice.
let running: Promise<void> | undefined = undefined

/**
 * @description Sends the queued changes, joining the run already going
 */
export const flushSaveChanges = (): Promise<void> => {
    running ??= sendQueue().finally(() => {
        running = undefined
    })
    return running
}

/**
 * @description Persists the change of one occurrence in the queue and sends the queue
 * @param change Save or unsave of the Visitor
 */
export const syncSaveChange = (change: SaveChange): Promise<void> => {
    const sync = localStorage.getItem("save-sync")
    localStorage.setItem("save-sync", {
        ...sync,
        pending: queueSaveChange(sync.pending, change),
    })
    return flushSaveChanges()
}

/**
 * @description Queues the stored saves on the first run on this device, then sends the queue
 */
export const startSaveSync = (): Promise<void> => {
    const sync = localStorage.getItem("save-sync")
    if (!sync.queuedStoredSaves) {
        localStorage.setItem("save-sync", {
            ...sync,
            queuedStoredSaves: true,
            pending: localStorage.getItem("saved-events").events.reduce(
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
