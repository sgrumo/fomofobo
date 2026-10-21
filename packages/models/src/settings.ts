import { z } from "@hono/zod-openapi"

import { accountSchema } from "./accounts"
import { MAX_ENDED_VISIBLE_DAYS, MAX_PARTICIPANT_THRESHOLD } from "./lib/limits"
import { instantSchema } from "./lib/local-time"

export const platformSettingsUpdateSchema = z.object({
    endedVisibleDays: z.int().min(0).max(MAX_ENDED_VISIBLE_DAYS),
    participantThreshold: z.int().min(1).max(MAX_PARTICIPANT_THRESHOLD),
})
export type PlatformSettingsUpdate = z.infer<typeof platformSettingsUpdateSchema>

// `updatedAt` is null while no Admin has saved the defaults; `updatedBy` also once that account is deleted
export const platformSettingsSchema = platformSettingsUpdateSchema.extend({
    updatedAt: instantSchema.nullable(),
    updatedBy: accountSchema.pick({ id: true, name: true }).nullable(),
})
export type PlatformSettings = z.infer<typeof platformSettingsSchema>
