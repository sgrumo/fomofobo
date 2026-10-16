import { z } from "@hono/zod-openapi"

/**
 * @description Builds a query parameter schema that reads one value or many as an array
 * @template T Item schema
 * @param item Schema of each value
 * @param maxItems Upper count of values
 */
export const queryArraySchema = <T extends z.ZodType>(
    item: T,
    maxItems: number,
): z.ZodPreprocess<z.ZodArray<T>> =>
    z.preprocess(
        value => (typeof value === "string" ? [value] : value),
        z.array(item).max(maxItems),
    )
