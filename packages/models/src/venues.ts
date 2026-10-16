import { z } from "@hono/zod-openapi"

import { geoPointSchema } from "./lib/geo"
import { paginationQuerySchema } from "./lib/pagination"
import { nonEmptyUpdate } from "./lib/updates"

export const venueSchema = z.object({
    id: z.uuid(),
    name: z.string().trim().min(1).max(120),
    address: z.string().trim().min(1).max(200),
    coordinates: geoPointSchema,
})
export type Venue = z.infer<typeof venueSchema>

export const venueCreationSchema = venueSchema.omit({ id: true })
export type VenueCreation = z.infer<typeof venueCreationSchema>

export const venueUpdateSchema = nonEmptyUpdate(venueCreationSchema.partial())
export type VenueUpdate = z.infer<typeof venueUpdateSchema>

export const venueListQuerySchema = paginationQuerySchema.extend({
    q: z.string().trim().min(1).optional(),
})
export type VenueListQuery = z.infer<typeof venueListQuerySchema>
