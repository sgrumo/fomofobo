import { z } from "@hono/zod-openapi"

import { accountSchema } from "./accounts"
import { customErrorParamsSchema } from "./lib/custom-errors"
import { MAX_EVENT_PHOTOS } from "./lib/limits"
import { instantSchema, localDateTimeSchema } from "./lib/local-time"
import { paginationQuerySchema } from "./lib/pagination"
import { facebookUrlSchema, instagramUrlSchema } from "./lib/social-links"
import { withTimeRange } from "./lib/time-range"
import { priceSchemeSchema } from "./price-scheme"
import { recurrenceSchema } from "./recurrence"
import { uploadContentTypeSchema, uploadRequestSchema } from "./uploads"
import { venueSchema } from "./venues"

export const photoContentTypeSchema = uploadContentTypeSchema.extract([
    "image/png",
    "image/jpeg",
    "image/webp",
])
export type PhotoContentType = z.infer<typeof photoContentTypeSchema>

export const ditheredPhotoContentTypeSchema = photoContentTypeSchema.extract([
    "image/png",
])
export type DitheredPhotoContentType = z.infer<typeof ditheredPhotoContentTypeSchema>

export const photoUploadRequestSchema = uploadRequestSchema.extend({
    contentType: ditheredPhotoContentTypeSchema,
})
export type PhotoUploadRequest = z.infer<typeof photoUploadRequestSchema>

export const eventPhotoSchema = z.object({
    id: z.uuid(),
    url: z.url(),
    position: z.int().nonnegative(),
})
export type EventPhoto = z.infer<typeof eventPhotoSchema>

export const eventGalleryPhotoSchema = eventPhotoSchema.extend({ key: z.string().min(1) })
export type EventGalleryPhoto = z.infer<typeof eventGalleryPhotoSchema>

export const eventExternalLinksSchema = z.object({
    instagramUrl: instagramUrlSchema.nullable(),
    facebookUrl: facebookUrlSchema.nullable(),
})
export type EventExternalLinks = z.infer<typeof eventExternalLinksSchema>

// PLACEHOLDER(OP-12)
const eventDescriptionSchema = z.string().trim().min(1).max(280).nullable()

const eventTitleSchema = z.string().trim().min(1).max(120)

const eventCapacitySchema = z.int().min(1).max(100_000).nullable()

// PLACEHOLDER(OP-11): the icon of the pin
const eventCategoriesShape = {
    categoryIds: z.array(z.uuid()).min(1),
    primaryCategoryId: z.uuid(),
}

export const eventSchema = z.object({
    id: z.uuid(),
    title: eventTitleSchema,
    description: eventDescriptionSchema,
    ...eventCategoriesShape,
    venue: venueSchema.pick({ id: true, name: true, address: true, coordinates: true }),
    startsAt: localDateTimeSchema,
    endsAt: localDateTimeSchema,
    recurrence: recurrenceSchema.nullable(),
    photos: z.array(eventGalleryPhotoSchema).max(MAX_EVENT_PHOTOS),
    externalLinks: eventExternalLinksSchema,
    priceScheme: priceSchemeSchema,
    capacity: eventCapacitySchema,
    organizer: accountSchema.pick({ id: true, name: true }),
    isBlocked: z.boolean(),
    // PLACEHOLDER(OP-22): `null` on a blocked event when the Admin gave no reason
    blockReason: z.string().nullable(),
    createdAt: instantSchema,
    updatedAt: instantSchema,
})
export type Event = z.infer<typeof eventSchema>

/**
 * @remarks Lists the photos as upload object keys in gallery order: the first key is the cover
 */
export const eventUpsertSchema = withTimeRange(
    z.object({
        title: eventTitleSchema,
        description: eventDescriptionSchema,
        ...eventCategoriesShape,
        venueId: z.uuid(),
        startsAt: localDateTimeSchema,
        endsAt: localDateTimeSchema,
        recurrence: recurrenceSchema.nullable(),
        photoKeys: z.array(z.string().min(1)).max(MAX_EVENT_PHOTOS),
        externalLinks: eventExternalLinksSchema,
        priceScheme: priceSchemeSchema,
        capacity: eventCapacitySchema,
        // PLACEHOLDER(OP-21, TQ-18): Admins alone may send it
        organizerId: z.uuid().optional(),
    }),
)
    .refine(event => event.categoryIds.includes(event.primaryCategoryId), {
        path: ["primaryCategoryId"],
        params: customErrorParamsSchema.encode({
            errorCode: "primary-category-not-in-list",
            message: "must be one of the categories",
        }),
    })
    .refine(
        event =>
            event.recurrence === null ||
            event.recurrence.rule.until >= event.startsAt.slice(0, 10),
        {
            path: ["recurrence", "rule", "until"],
            params: customErrorParamsSchema.encode({
                errorCode: "until-before-first-date",
                message: "must be on or after the first date",
            }),
        },
    )
export type EventUpsert = z.infer<typeof eventUpsertSchema>

export const eventListItemSchema = eventSchema
    .pick({
        id: true,
        title: true,
        startsAt: true,
        endsAt: true,
        organizer: true,
        isBlocked: true,
        blockReason: true,
    })
    .extend({
        isRecurring: z.boolean(),
        venue: venueSchema.pick({ id: true, name: true }),
    })
export type EventListItem = z.infer<typeof eventListItemSchema>

export const eventListQuerySchema = paginationQuerySchema.extend({
    q: z.string().trim().min(1).optional(),
    organizerId: z.uuid().optional(),
    isBlocked: z.stringbool().optional(),
})
export type EventListQuery = z.infer<typeof eventListQuerySchema>

// PLACEHOLDER(OP-22)
export const eventBlockSchema = z.object({ reason: z.string().trim().min(1).max(280) })
export type EventBlock = z.infer<typeof eventBlockSchema>
