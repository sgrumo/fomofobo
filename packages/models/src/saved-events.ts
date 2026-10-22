import { z } from "@hono/zod-openapi"

import { instantSchema, localDateSchema } from "./lib/local-time"
import { occurrenceRefSchema } from "./occurrences"

// PLACEHOLDER(OP-18): one occurrence, or the whole series
export const savedEventSchema = occurrenceRefSchema.extend({ savedAt: instantSchema })
export type SavedEvent = z.infer<typeof savedEventSchema>

/**
 * @remarks Needs a `version` bump on each change of the shape
 */
export const savedEventsStorageSchema = z.object({
    version: z.literal(1),
    events: z.array(savedEventSchema),
})
export type SavedEventsStorage = z.infer<typeof savedEventsStorageSchema>

export const saveChangeSchema = occurrenceRefSchema.extend({
    action: z.enum(["save", "unsave"]),
})
export type SaveChange = z.infer<typeof saveChangeSchema>

/**
 * @remarks Needs a `version` bump on each change of the shape
 */
export const saveSyncStorageSchema = z.object({
    version: z.literal(1),
    queuedStoredSaves: z.boolean(),
    pending: z.array(saveChangeSchema),
})
export type SaveSyncStorage = z.infer<typeof saveSyncStorageSchema>

export const occurrenceSaveSchema = z.object({ deviceId: z.uuid() })
export type OccurrenceSave = z.infer<typeof occurrenceSaveSchema>

export const occurrenceSaveCountSchema = z.object({
    date: localDateSchema,
    startsAt: instantSchema,
    count: z.int().nonnegative(),
})
export type OccurrenceSaveCount = z.infer<typeof occurrenceSaveCountSchema>
