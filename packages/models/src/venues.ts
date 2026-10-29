import { z } from "@hono/zod-openapi"
import { weekDays } from "shared/temporal"

import { accountSchema } from "./accounts"
import { geoPointSchema } from "./lib/geo"
import { paginationQuerySchema } from "./lib/pagination"
import { facebookUrlSchema, instagramUrlSchema } from "./lib/social-links"
import { nonEmptyUpdate } from "./lib/updates"

export const venueLinksSchema = z.object({
    websiteUrl: z
        .url({ protocol: /^https$/u })
        .max(500)
        .nullable(),
    instagramUrl: instagramUrlSchema.nullable(),
    facebookUrl: facebookUrlSchema.nullable(),
})
export type VenueLinks = z.infer<typeof venueLinksSchema>

export const venueKindValues = [
    "regular",
    "cinema",
    "museum",
    "theatre",
    "gallery",
] as const
export const venueKindSchema = z.enum(venueKindValues)
export type VenueKind = z.infer<typeof venueKindSchema>

export const permanentVenueKindSchema = venueKindSchema.exclude(["regular"])
export type PermanentVenueKind = z.infer<typeof permanentVenueKindSchema>

export const venueProgrammeUrlSchema = z.url({ protocol: /^https$/u }).max(500)

// Empty when the venue never closes
export const venueClosingDaysSchema = z.array(z.enum(weekDays)).max(weekDays.length)
export type VenueClosingDays = z.infer<typeof venueClosingDaysSchema>

export const venueSchema = z.object({
    id: z.uuid(),
    name: z.string().trim().min(1).max(120),
    address: z.string().trim().min(1).max(200),
    coordinates: geoPointSchema,
    description: z.string().trim().min(1).max(500).nullable(),
    coverPhotoUrl: z.url().nullable(),
    links: venueLinksSchema,
    kind: venueKindSchema,
    // `programmeUrl` and `categoryId` are `null` exactly when the kind is `regular`
    programmeUrl: venueProgrammeUrlSchema.nullable(),
    categoryId: z.uuid().nullable(),
    // `null` for a regular venue, and for a permanent venue whose closing days nobody set
    closingDays: venueClosingDaysSchema.nullable(),
    owner: accountSchema.pick({ id: true, name: true }).nullable(),
    isBlocked: z.boolean(),
    blockReason: z.string().nullable(),
})
export type Venue = z.infer<typeof venueSchema>

export const venueCreationSchema = venueSchema.pick({
    name: true,
    address: true,
    coordinates: true,
})
export type VenueCreation = z.infer<typeof venueCreationSchema>

export const venueUpdateSchema = nonEmptyUpdate(
    venueCreationSchema
        .extend({
            description: venueSchema.shape.description,
            links: venueLinksSchema,
            coverPhotoKey: z.string().min(1).nullable(),
        })
        .partial(),
)
export type VenueUpdate = z.infer<typeof venueUpdateSchema>

export const permanentVenueKindChangeSchema = z.object({
    kind: permanentVenueKindSchema,
    programmeUrl: venueProgrammeUrlSchema,
    categoryId: z.uuid(),
    closingDays: venueClosingDaysSchema,
})
export type PermanentVenueKindChange = z.infer<typeof permanentVenueKindChangeSchema>

export const venueKindChangeSchema = z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("regular") }),
    permanentVenueKindChangeSchema,
])
export type VenueKindChange = z.infer<typeof venueKindChangeSchema>

export const venueOwnerSchema = z.object({ ownerId: z.uuid().nullable() })
export type VenueOwner = z.infer<typeof venueOwnerSchema>

export const venueBlockSchema = z.object({ reason: z.string().trim().min(1).max(280) })
export type VenueBlock = z.infer<typeof venueBlockSchema>

export const venueListQuerySchema = paginationQuerySchema.extend({
    q: z.string().trim().min(1).optional(),
    isBlocked: z.stringbool().optional(),
})
export type VenueListQuery = z.infer<typeof venueListQuerySchema>
