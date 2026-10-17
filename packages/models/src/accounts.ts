import { z } from "@hono/zod-openapi"

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./lib/limits"
import { instantSchema } from "./lib/local-time"
import { paginationQuerySchema } from "./lib/pagination"

export const accountRoleValues = ["organizer", "admin"] as const
export const accountRoleSchema = z.enum(accountRoleValues)
export type AccountRole = z.infer<typeof accountRoleSchema>

export const accountSchema = z.object({
    id: z.uuid(),
    name: z.string().trim().min(1).max(120),
    email: z.email(),
    role: accountRoleSchema,
    isBlocked: z.boolean(),
    createdAt: instantSchema,
})
export type Account = z.infer<typeof accountSchema>

export const accountPasswordSchema = z
    .string()
    .min(MIN_PASSWORD_LENGTH)
    .max(MAX_PASSWORD_LENGTH)
export type AccountPassword = z.infer<typeof accountPasswordSchema>

export const accountCredentialsSchema = z.object({
    email: accountSchema.shape.email,
    password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
})
export type AccountCredentials = z.infer<typeof accountCredentialsSchema>

export const organizerCreationSchema = z.object({
    name: accountSchema.shape.name,
    email: accountSchema.shape.email,
    password: accountPasswordSchema,
})
export type OrganizerCreation = z.infer<typeof organizerCreationSchema>

export const organizerPasswordSchema = z.object({ password: accountPasswordSchema })
export type OrganizerPassword = z.infer<typeof organizerPasswordSchema>

export const organizerListQuerySchema = paginationQuerySchema.extend({
    q: z.string().trim().min(1).optional(),
    isBlocked: z.stringbool().optional(),
})
export type OrganizerListQuery = z.infer<typeof organizerListQuerySchema>
