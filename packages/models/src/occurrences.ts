import { z } from "@hono/zod-openapi"

import { eventExternalLinksSchema, eventPhotoSchema, eventSchema } from "./events"
import { MAX_LOOKUP_REFS } from "./lib/limits"
import { instantSchema, localDateSchema } from "./lib/local-time"
import { queryArraySchema } from "./lib/query-array"
import { venueSchema } from "./venues"

export const occurrenceStatusSchema = z.enum(["upcoming", "live", "ended"])
export type OccurrenceStatus = z.infer<typeof occurrenceStatusSchema>

/**
 * @remarks Names an occurrence by the local date of its start, never by a row id: the
 * occurrence rows change on every save of the event
 */
export const occurrenceRefSchema = z.object({
    eventId: z.uuid(),
    date: localDateSchema,
})
export type OccurrenceRef = z.infer<typeof occurrenceRefSchema>

export const occurrenceSummarySchema = occurrenceRefSchema.extend({
    startsAt: instantSchema,
    endsAt: instantSchema,
    title: eventSchema.shape.title,
    description: eventSchema.shape.description,
    venue: venueSchema.pick({ id: true, name: true, coordinates: true, isBlocked: true }),
    categoryIds: eventSchema.shape.categoryIds,
    primaryCategoryId: eventSchema.shape.primaryCategoryId,
    coverPhotoUrl: z.url(),
    priceScheme: eventSchema.shape.priceScheme,
    // `null` under the participant threshold of the platform settings
    interestedCount: z.int().nonnegative().nullable(),
})
export type OccurrenceSummary = z.infer<typeof occurrenceSummarySchema>

export const occurrenceDetailSchema = occurrenceSummarySchema.extend({
    venue: venueSchema.pick({
        id: true,
        name: true,
        address: true,
        coordinates: true,
        isBlocked: true,
    }),
    photos: z.array(eventPhotoSchema),
    externalLinks: eventExternalLinksSchema,
    capacity: eventSchema.shape.capacity,
})
export type OccurrenceDetail = z.infer<typeof occurrenceDetailSchema>

export const occurrenceRefKeySchema = z
    .string()
    .regex(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}:\d{4}-\d{2}-\d{2}$/u)
export type OccurrenceRefKey = z.infer<typeof occurrenceRefKeySchema>

export const occurrenceLookupQuerySchema = z.object({
    ref: queryArraySchema(occurrenceRefKeySchema, MAX_LOOKUP_REFS),
})
export type OccurrenceLookupQuery = z.infer<typeof occurrenceLookupQuerySchema>
