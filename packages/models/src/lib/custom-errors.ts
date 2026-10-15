import { z } from "@hono/zod-openapi"

export const customErrorCodeSchema = z.enum([
    "not-semver",
    "empty-update",
    "end-before-start",
    "duration-too-long",
    "until-before-first-date",
    "primary-category-not-in-list",
    "duplicate-date",
    "date-added-and-removed",
    "range-incomplete",
])
export type CustomErrorCode = z.infer<typeof customErrorCodeSchema>

/**
 * @remarks Belongs in the `params` of a `refine`, since an `error` string preempts
 * the frontend error map and the code never reaches it
 */
export const customErrorParamsSchema = z.object({
    errorCode: customErrorCodeSchema,
    message: z.string(),
})
export type CustomErrorParams = z.infer<typeof customErrorParamsSchema>
