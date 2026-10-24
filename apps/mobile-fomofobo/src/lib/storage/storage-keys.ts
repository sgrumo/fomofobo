import { savedEventsStorageSchema, saveSyncStorageSchema } from "models"
import { z } from "zod"

export const deviceStorageSchema = {
    "saved-events": savedEventsStorageSchema,
    "save-sync": saveSyncStorageSchema,
    "device-id": z.uuid().nullable(),
}
export type DeviceStorageKey = keyof typeof deviceStorageSchema

export const deviceStorageDefaults: {
    [K in DeviceStorageKey]: z.output<(typeof deviceStorageSchema)[K]>
} = {
    "saved-events": { version: 1, events: [] },
    "save-sync": { version: 1, queuedStoredSaves: false, pending: [] },
    "device-id": null,
}
