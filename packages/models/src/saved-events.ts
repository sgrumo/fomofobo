import { z } from "@hono/zod-openapi"

import { instantSchema } from "./lib/local-time"
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
