import { z } from "@hono/zod-openapi"
import type { Context } from "hono"
import { createMiddleware } from "hono/factory"
import type { HTTPResponseError } from "hono/types"
import type { ApiError } from "models"
import { HttpStatus } from "models"
import { match, P } from "ts-pattern"
import { ZodError } from "zod"

import { logger } from "../logger"
import { ApplicationError, serializeError } from "./app-error"

/**
 * @description Logs the request, then the response with its status and duration
 */
export const loggerMiddleware = createMiddleware(async (c, next) => {
    const start = Date.now()
    const reqId = crypto.randomUUID()

    logger.info("request", {
        method: c.req.method,
        path: c.req.path,
        reqId,
    })

    await next()
    const ms = Date.now() - start

    logger.log(c.res.status < 400 ? "info" : "error", "response", {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        ms,
        reqId,
    })
})

/** Body of a server failure when `verboseErrors` is off. The log keeps the cause. */
const opaqueServerMessage = "An internal error occurred"

/**
 * @description Returns a handler rendering a caught error as an `ApiError` body
 * @template T Error code union of the application errors
 * @param mapper Mapper from an application error to an HTTP status
 * @param options Response shaping. `verboseErrors` exposes the stack, the cause and the
 * message of a `5xx`
 * @remarks Renders every unmapped error as `500` with the code `UnknownError`
 * @remarks Keeps the message of a `4xx` also with `verboseErrors` off, because it
 * describes the request the caller sent
 */
export const handleErrors =
    <T extends string>(
        mapper: (err: ApplicationError<T>) => HttpStatus,
        options: { verboseErrors: boolean },
    ) =>
    (err: Error | HTTPResponseError, c: Context): Response => {
        const isProd = !options.verboseErrors

        return match(err)
            .with(P.instanceOf(ApplicationError), e => {
                logger.error("Application error", { error: serializeError(e) })
                // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- ts-pattern narrows to ApplicationError<string>; generic T is invariant, so we recover the caller's T here
                const appErr = e as ApplicationError<T>
                const status = mapper(appErr)
                const hideMessage = isProd && status >= HttpStatus.InternalError
                c.status(status)
                return c.json<ApiError>({
                    code: appErr.code,
                    message: hideMessage ? opaqueServerMessage : appErr.message,
                    status,
                    stack: isProd ? undefined : appErr.stack,
                    cause: isProd ? undefined : serializeError(appErr.cause),
                })
            })
            .with(P.instanceOf(ZodError), e => {
                const message = z.prettifyError(e)
                logger.error("Zod validation error", {
                    error: message,
                    issues: e.issues,
                })
                return c.json<ApiError>(
                    {
                        code: "ResponseValidationError",
                        message: isProd
                            ? "An internal validation error occurred"
                            : message,
                        status: HttpStatus.InternalError,
                        stack: isProd ? undefined : e.stack,
                    },
                    HttpStatus.InternalError,
                )
            })
            .otherwise(e => {
                logger.error("Unhandled error", { error: serializeError(e) })
                return c.json<ApiError>(
                    {
                        code: "UnknownError",
                        message: isProd
                            ? "An unexpected error occurred"
                            : `${e.name}: ${e.message}`,
                        status: HttpStatus.InternalError,
                        stack: isProd ? undefined : e.stack,
                    },
                    HttpStatus.InternalError,
                )
            })
    }
