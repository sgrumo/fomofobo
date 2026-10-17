import { z } from "@hono/zod-openapi"

export const HttpStatus = {
    Ok: 200,
    Created: 201,
    NoContent: 204,
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    Conflict: 409,
    TooManyRequests: 429,
    InternalError: 500,
    ServiceUnavailable: 503,
} as const
export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus]

export const apiErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    status: z.number(),
    stack: z.string().optional(),
    cause: z.unknown().optional(),
})
export type ApiError = z.infer<typeof apiErrorSchema>
