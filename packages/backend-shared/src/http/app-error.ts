import { z } from "@hono/zod-openapi"
import { match, P } from "ts-pattern"
import { ZodError } from "zod"

export interface SerializedError {
    name: string
    message: string
    stack?: string
    code?: string
    cause?: unknown
}

export class ApplicationError<T extends string = string> extends Error {
    public code: T

    public constructor(code: T, message: string, options?: { cause?: unknown }) {
        super(message, options)
        this.code = code
        this.name = "ApplicationError"
    }
}

/**
 * @description True when the value is an `ApplicationError`
 * @param error Value checked
 */
const isApplicationError = (error: unknown): error is ApplicationError =>
    error instanceof ApplicationError

/**
 * @description Maps an error to a plain object holding its message, stack and cause
 * @param error Value serialized
 * @remarks Returns the value untouched when it is not an `Error`
 */
export const serializeError = (error: unknown): unknown => {
    if (!(error instanceof Error)) {
        return error
    }
    return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(isApplicationError(error) ? { code: error.code } : {}),
        ...(error.cause === undefined ? {} : { cause: serializeError(error.cause) }),
    }
}

export interface ApplicationErrorCodes<T extends string> {
    /** Code of an error the application does not recognize. */
    generic: T
    /** Code of a response that violates the schema of its route. */
    responseValidation: T
    /** Code of a request that no mounted route matches. */
    routeNotFound: T
}

export interface ApplicationErrorUtils<T extends string> {
    appError: (code: T, message: string) => ApplicationError<T>
    toApplicationError: (error: unknown, context: string) => ApplicationError<T>
    handleRouteNotFound: () => never
}

/**
 * @description Returns the error helpers bound to the error-code union of one application
 * @template T Error code union of the application
 * @param codes Codes the helpers raise on their own
 * @remarks Keeps the union inside the application, so this package declares no code
 */
export const createErrorUtils = <T extends string>(
    codes: ApplicationErrorCodes<T>,
): ApplicationErrorUtils<T> => {
    const appError = (code: T, message: string): ApplicationError<T> =>
        new ApplicationError(code, message)

    const toApplicationError = (error: unknown, context: string): ApplicationError<T> =>
        match(error)
            .with(
                P.instanceOf(ApplicationError),
                e =>
                    new ApplicationError(
                        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- ts-pattern narrows to ApplicationError<string>; T is the narrower union of the application, recovered here
                        e.code as T,
                        e.message,
                        { cause: e.cause },
                    ),
            )
            .with(
                P.instanceOf(ZodError),
                e =>
                    new ApplicationError(
                        codes.responseValidation,
                        `${context}: ${z.prettifyError(e)}`,
                        { cause: e },
                    ),
            )
            .otherwise(
                e =>
                    new ApplicationError(
                        codes.generic,
                        `${context}: ${e instanceof Error ? e.message : String(e)}`,
                        { cause: e },
                    ),
            )

    const handleRouteNotFound = (): never => {
        throw appError(
            codes.routeNotFound,
            "The requested route is invalid or not mounted",
        )
    }

    return { appError, toApplicationError, handleRouteNotFound }
}
