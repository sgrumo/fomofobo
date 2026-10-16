import type { Hook } from "@hono/zod-openapi"
import { OpenAPIHono, z } from "@hono/zod-openapi"
import type { Env } from "hono"
import type { ApiError } from "models"
import { HttpStatus } from "models"

/**
 * @description Builds the hook that answers a failed validation with `400`, or returns
 * `undefined` to continue
 * @template T Bindings and variables of the router the hook serves
 */
export const buildValidationHook =
    <T extends Env>(): Hook<unknown, T, string, unknown> =>
    (result, c) => {
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
 * @template T Bindings and variables the middlewares of the app set
 */
export const createRouter = <T extends Env = Env>(): OpenAPIHono<T> =>
    new OpenAPIHono<T>({
        defaultHook: buildValidationHook<T>(),
    })
