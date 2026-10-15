import type { Hook } from "@hono/zod-openapi"
import { OpenAPIHono, z } from "@hono/zod-openapi"
import type { Env } from "hono"
import type { ApiError } from "models"
import { HttpStatus } from "models"

/**
 * @description Returns a `400` response for a failed validation, or `undefined` to
 * continue
 * @param result Validation result of the request
 * @param c Request context
 */
export const defaultValidationHook: Hook<unknown, Env, string, unknown> = (result, c) => {
    if (!result.success) {
        return c.json<ApiError>(
            {
                code: "InvalidRequest",
                message: z.prettifyError(result.error),
                status: HttpStatus.BadRequest,
            },
            HttpStatus.BadRequest,
        )
    }
    return undefined
}

/**
 * @description Returns a router applying the shared validation hook
 */
export const createRouter = (): OpenAPIHono =>
    new OpenAPIHono({
        defaultHook: defaultValidationHook,
    })
