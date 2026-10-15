import type { z } from "@hono/zod-openapi"

import { customErrorParamsSchema } from "./custom-errors"

/**
 * @description Builds an update schema rejecting a payload that carries no field
 * @template T Update schema type
 * @param schema Update schema, with every field optional
 * @remarks Guards Drizzle `.set({})`, which throws when every field is `undefined`
 */
export const nonEmptyUpdate = <T extends z.ZodObject>(schema: T): T =>
    schema.refine(update => Object.values(update).some(value => value !== undefined), {
        params: customErrorParamsSchema.encode({
            errorCode: "empty-update",
            message: "must carry at least one field",
        }),
    })
