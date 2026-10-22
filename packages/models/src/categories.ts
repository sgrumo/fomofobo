import { z } from "@hono/zod-openapi"

import { nonEmptyUpdate } from "./lib/updates"

// PLACEHOLDER(TQ-05)
export const categoryIconValues = [
    "music",
    "comedy",
    "art",
    "theatre",
    "cinema",
    "food",
    "party",
    "talk",
    "sport",
    "market",
    "other",
] as const
export const categoryIconSchema = z.enum(categoryIconValues)
export type CategoryIcon = z.infer<typeof categoryIconSchema>

export const categorySchema = z.object({
    id: z.uuid(),
    name: z.string().trim().min(1).max(60),
    icon: categoryIconSchema,
    imageUrl: z.url().nullable(),
})
export type Category = z.infer<typeof categorySchema>

export const categoryCreationSchema = categorySchema.pick({ name: true, icon: true })
export type CategoryCreation = z.infer<typeof categoryCreationSchema>

export const categoryUpdateSchema = nonEmptyUpdate(
    categoryCreationSchema.extend({ imageKey: z.string().min(1).nullable() }).partial(),
)
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>
