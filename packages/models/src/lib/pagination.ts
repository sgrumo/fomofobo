import { z } from "@hono/zod-openapi"

export const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
})
export type PaginationQuery = z.infer<typeof paginationQuerySchema>

/**
 * @description Builds a paginated response schema wrapping the item schema
 * @template T Item schema type
 * @param itemSchema Schema validating one item
 */
export const paginatedResponseSchema = <T extends z.ZodType>(
    itemSchema: T,
): z.ZodObject<{
    items: z.ZodArray<T>
    total: z.ZodNumber
    page: z.ZodNumber
    pageSize: z.ZodNumber
    totalPages: z.ZodNumber
}> =>
    z.object({
        items: z.array(itemSchema),
        total: z.number().int().nonnegative(),
        page: z.number().int().min(1),
        pageSize: z.number().int().min(1),
        totalPages: z.number().int().nonnegative(),
    })
