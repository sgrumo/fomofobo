import { z } from "@hono/zod-openapi"

import { customErrorParamsSchema } from "./lib/custom-errors"
import { instantSchema, localDateSchema } from "./lib/local-time"
import { occurrenceSummarySchema } from "./occurrences"

export const dateFilterKindSchema = z.enum([
    "default",
    "today",
    "tomorrow",
    "weekend",
    "range",
])
export type DateFilterKind = z.infer<typeof dateFilterKindSchema>

/**
 * @remarks Stays flat, because it parses from a URL query string: `from` and `to` count
 * only when `date` is `range`
 */
export const publicSearchQuerySchema = z
    .object({
        lat: z.coerce.number().min(-90).max(90),
        lng: z.coerce.number().min(-180).max(180),
        q: z.string().trim().min(1).optional(),
        // PLACEHOLDER(OP-10)
        categoryIds: z.array(z.uuid()).optional(),
        date: dateFilterKindSchema.default("default"),
        // PLACEHOLDER(OP-09): past dates
        from: localDateSchema.optional(),
        to: localDateSchema.optional(),
    })
    .refine(
        query =>
            query.date !== "range" ||
            (query.from !== undefined && query.to !== undefined),
        {
            path: ["to"],
            params: customErrorParamsSchema.encode({
                errorCode: "range-incomplete",
                message: "must give both dates of the range",
            }),
        },
    )
    .refine(
        query =>
            query.date !== "range" ||
            query.from === undefined ||
            query.to === undefined ||
            query.to >= query.from,
        {
            path: ["to"],
            params: customErrorParamsSchema.encode({
                errorCode: "end-before-start",
                message: "must be on or after the start",
            }),
        },
    )
export type PublicSearchQuery = z.infer<typeof publicSearchQuerySchema>

export const publicSearchResponseSchema = z.object({
    window: z.object({ from: instantSchema, to: instantSchema }),
    occurrences: z.array(occurrenceSummarySchema),
    categoryCounts: z.array(
        z.object({ categoryId: z.uuid(), count: z.int().nonnegative() }),
    ),
    truncated: z.boolean(),
})
export type PublicSearchResponse = z.infer<typeof publicSearchResponseSchema>
