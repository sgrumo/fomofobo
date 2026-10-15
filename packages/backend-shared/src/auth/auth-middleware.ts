import type { Context, MiddlewareHandler } from "hono"
import { getCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"

import { ApplicationError } from "../http/app-error"
import type { TokenVerifier, VerifiedToken } from "./token-verifier"
import { TokenVerificationError } from "./token-verifier"

declare module "hono" {
    interface ContextVariableMap {
        /** Identity of the request, absent on a path the middleware leaves open. */
        auth: VerifiedToken | undefined
    }
}

export interface AuthMiddlewareOptions {
    /** Verifier of the provider that signs the tokens. */
    verifier: TokenVerifier
    /** Code raised when the request carries no valid token. Maps to `401`. */
    unauthenticatedCode: string
    /** Code raised when the provider cannot be reached to verify one. Maps to `503`. */
    unavailableCode: string
    /**
     * Cookie holding the access token, for a caller that keeps the token out of the
     * browser. Read on `GET` and `HEAD` alone: a cookie rides any request the browser
     * sends, a header rides the ones the caller wrote, and a change deserves the
     * second. The `Authorization` header wins when both are present.
     */
    cookieName?: string
    /** Paths served without a token, matched whole. */
    publicPaths?: readonly string[]
}

const bearerScheme = "bearer "

/** Methods that read. A cookie authenticates these alone. */
const readMethods: ReadonlySet<string> = new Set(["GET", "HEAD"])

/**
 * @description Returns the token of the request, from the header or from the cookie
 * @param c Request context
 * @param cookieName Cookie holding the token, when the caller keeps one
 * @remarks Compares the scheme without case, as RFC 9110 defines it
 */
const readToken = (c: Context, cookieName: string | undefined): string | undefined => {
    const header = c.req.header("Authorization")
    if (
        header !== undefined &&
        header.slice(0, bearerScheme.length).toLowerCase() === bearerScheme
    ) {
        return header.slice(bearerScheme.length)
    }

    return cookieName !== undefined && readMethods.has(c.req.method)
        ? getCookie(c, cookieName)
        : undefined
}

/**
 * @description Builds the middleware that rejects a request without a valid token
 * @param options Verifier, error codes, cookie name and open paths
 * @throws When the request carries no token, or one the provider did not sign, or
 * when the provider cannot be reached
 * @remarks Guards the application, not one router, so the in-process dispatch of a
 * Server Component and the HTTP call of a browser both meet the same check
 * @remarks Sets the identity on the context. Read it with `getAuth`
 */
export const createAuthMiddleware = (
    options: AuthMiddlewareOptions,
): MiddlewareHandler => {
    const publicPaths = new Set(options.publicPaths)

    return createMiddleware(async (c, next) => {
        if (publicPaths.has(c.req.path)) {
            await next()
            return
        }

        const token = readToken(c, options.cookieName)
        if (token === undefined) {
            throw new ApplicationError(
                options.unauthenticatedCode,
                "The request carries no access token",
            )
        }

        try {
            c.set("auth", await options.verifier.verify(token))
        } catch (error) {
            if (error instanceof TokenVerificationError) {
                throw new ApplicationError(
                    error.reason === "unavailable"
                        ? options.unavailableCode
                        : options.unauthenticatedCode,
                    error.message,
                    { cause: error },
                )
            }
            throw error
        }

        await next()
    })
}

/**
 * @description Returns the identity the middleware verified for this request
 * @param c Request context
 * @throws When the route runs outside the authentication middleware
 */
export const getAuth = (c: Context): VerifiedToken => {
    const auth = c.get("auth")
    if (auth === undefined) {
        throw new Error(
            "No identity on the context: the route bypasses the auth middleware",
        )
    }
    return auth
}
