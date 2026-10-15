import "server-only"
import { z } from "@hono/zod-openapi"
import { logger } from "backend-shared"
import { readUnverifiedClaims } from "backend-shared/auth"
import { once } from "es-toolkit"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"
import { Result } from "shared/result"

import { getSessionCookieConfig } from "./cookie-names"

/** Identity of the visitor, as the session cookies carry it. */
export interface Session {
    /** Token forwarded to the API, which verifies it on every call. */
    accessToken: string
    /** `sub` claim of the provider. */
    subject: string
    /** Display name, when the provider sends one. */
    name: string | undefined
    /** Email, when the provider sends one. */
    email: string | undefined
}

/** Tokens the provider answers a code or a refresh with. */
export interface SessionTokens {
    accessToken: string
    refreshToken: string | undefined
    idToken: string | undefined
}

/** State of one login round trip, kept between the redirect and the callback. */
export interface LoginFlow {
    /** PKCE verifier, which the callback sends to prove it started the flow. */
    verifier: string
    /** `state`, which the callback compares with the one the provider returns. */
    state: string
    /** Path the visitor asked for before the login. */
    returnTo: string
}

interface SessionCookieOptions {
    httpOnly: boolean
    secure: boolean
    sameSite: "lax"
    path: string
    maxAge?: number
}

/** A login round trip is a redirect and a form post. Ten minutes cover both. */
const flowMaxAgeSeconds = 600

/** Shape of the flow cookie. Its body is a boundary, so a schema reads it. */
const loginFlowSchema = z.object({
    verifier: z.string().nonempty(),
    state: z.string().nonempty(),
    returnTo: z.string().nonempty(),
})

/**
 * @description Reports an access token this app cannot read, one time per process
 * @remarks Names a configuration nobody can fix at run time, so it goes out once
 * instead of once per request
 */
const reportOpaqueToken = once(() => {
    logger.error(
        "The access token of the provider is not a JWT. This API verifies a signed token, so every call will answer 401. Ask the provider for a JWT access token, which several of them mint only when the authorization request names an audience.",
    )
})

/**
 * @description Returns the cookie settings of this environment
 * @param secure True where the app answers over HTTPS
 * @param maxAgeSeconds Lifetime, absent for a session cookie
 * @remarks Sets `SameSite=Lax`, not `Strict`: the provider sends the visitor back with
 * a top-level GET, and a `Strict` cookie would not travel with it
 */
const buildCookieOptions = (
    secure: boolean,
    maxAgeSeconds?: number,
): SessionCookieOptions => ({
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    ...(maxAgeSeconds === undefined ? {} : { maxAge: maxAgeSeconds }),
})

/**
 * @description True when the claims name an expiry the provider has already passed
 * @param claims Claims of the access token
 */
const isExpired = (claims: { exp?: number }): boolean =>
    claims.exp !== undefined && claims.exp * 1000 <= Date.now()

/**
 * @description Returns the session of the request, absent when nobody is signed in
 * @throws When the environment misses a variable of its `APP_ENV` variant
 * @remarks Reads the claims **without** checking the signature, which is enough here:
 * the cookie is `HttpOnly` and this app wrote it. The security boundary is the API,
 * where the Hono middleware verifies the same token against the key set of the provider
 * @remarks Drops a session whose access token expired, so the guard sends the visitor
 * back to the provider instead of the API answering `401` on every call
 * @remarks Keeps a session whose access token is opaque, and reports the cause once. It
 * cannot read the expiry of such a token, so the API becomes the judge: the guard would
 * otherwise bounce the visitor between the login and the provider with nothing logged
 */
export const getSession = async (): Promise<Session | undefined> => {
    const { names } = getSessionCookieConfig()
    const store = await cookies()

    const accessToken = store.get(names.access)?.value
    if (accessToken === undefined) {
        return undefined
    }

    const accessClaims = readUnverifiedClaims(accessToken)
    if (accessClaims !== undefined && isExpired(accessClaims)) {
        return undefined
    }

    if (accessClaims === undefined) {
        reportOpaqueToken()
    }

    const idClaims = readUnverifiedClaims(store.get(names.idToken)?.value ?? "")
    const profile = idClaims ?? accessClaims
    if (profile === undefined) {
        return undefined
    }

    return {
        accessToken,
        subject: profile.sub ?? "",
        name: typeof profile.name === "string" ? profile.name : undefined,
        email: typeof profile.email === "string" ? profile.email : undefined,
    }
}

/**
 * @description Returns the access token of the request, for a call to the API
 * @throws When the environment misses a variable of its `APP_ENV` variant
 * @remarks Skips the expiry check of `getSession`, so an expired token still reaches
 * the API and comes back as the `401` the browser refreshes on
 */
export const getAccessToken = async (): Promise<string | undefined> => {
    const { names } = getSessionCookieConfig()
    const store = await cookies()
    return store.get(names.access)?.value
}

/**
 * @description Writes the session cookies of a token set on the response
 * @param response Response the browser receives
 * @param tokens Tokens the provider answered with
 * @throws When the environment misses a variable of its `APP_ENV` variant
 * @remarks Writes on the response, **never** through `cookies()`: a route handler that
 * ends in `redirect()` drops whatever the request store holds, and every route of this
 * flow ends in one
 * @remarks Writes session cookies, with no `Max-Age`: the browser drops them when it
 * closes, and the lifetime of the session belongs to the token itself
 */
export const writeSessionCookies = (
    response: NextResponse,
    tokens: SessionTokens,
): void => {
    const { names, secure } = getSessionCookieConfig()
    const options = buildCookieOptions(secure)

    response.cookies.set(names.access, tokens.accessToken, options)

    if (tokens.refreshToken !== undefined) {
        response.cookies.set(names.refresh, tokens.refreshToken, options)
    }
    if (tokens.idToken !== undefined) {
        response.cookies.set(names.idToken, tokens.idToken, options)
    }
}

/**
 * @description Returns the refresh token of the request
 * @throws When the environment misses a variable of its `APP_ENV` variant
 */
export const getRefreshToken = async (): Promise<string | undefined> => {
    const { names } = getSessionCookieConfig()
    const store = await cookies()
    return store.get(names.refresh)?.value
}

/**
 * @description Returns the id token of the request, for the logout redirect
 * @throws When the environment misses a variable of its `APP_ENV` variant
 */
export const getIdToken = async (): Promise<string | undefined> => {
    const { names } = getSessionCookieConfig()
    const store = await cookies()
    return store.get(names.idToken)?.value
}

/**
 * @description Deletes every session cookie on the response
 * @param response Response the browser receives
 * @throws When the environment misses a variable of its `APP_ENV` variant
 * @remarks Repeats the path and the `Secure` flag on the deletion. A `__Host-` cookie
 * needs both on **every** `Set-Cookie` that names it, and a browser drops a deletion
 * that carries neither: the session would survive the sign-out
 */
export const clearSessionCookies = (response: NextResponse): void => {
    const { names, secure } = getSessionCookieConfig()

    for (const name of [names.access, names.refresh, names.idToken, names.flow]) {
        response.cookies.delete({ name, path: "/", secure })
    }
}

/**
 * @description Writes the state of one login round trip on the response
 * @param response Response the browser receives
 * @param flow PKCE verifier, `state` and return path
 * @throws When the environment misses a variable of its `APP_ENV` variant
 */
export const writeLoginFlow = (response: NextResponse, flow: LoginFlow): void => {
    const { names, secure } = getSessionCookieConfig()

    response.cookies.set(
        names.flow,
        JSON.stringify(flow),
        buildCookieOptions(secure, flowMaxAgeSeconds),
    )
}

/**
 * @description Returns the login round trip a cookie body holds, absent on any other body
 * @param raw Cookie value read, absent when no cookie exists
 * @remarks Returns `undefined` on a body this app did not write, so a planted cookie
 * ends the flow instead of driving it
 */
export const parseLoginFlow = (raw: string | undefined): LoginFlow | undefined => {
    if (raw === undefined) {
        return undefined
    }

    const decoded = Result.try((): unknown => JSON.parse(raw))
    if (!decoded.success) {
        return undefined
    }

    const flow = loginFlowSchema.safeParse(decoded.value)
    return flow.success ? flow.data : undefined
}

/**
 * @description Returns the state of the login round trip, absent when it expired
 * @throws When the environment misses a variable of its `APP_ENV` variant
 */
export const readLoginFlow = async (): Promise<LoginFlow | undefined> => {
    const { names } = getSessionCookieConfig()
    const store = await cookies()
    return parseLoginFlow(store.get(names.flow)?.value)
}

/**
 * @description Deletes the cookie of the login round trip on the response
 * @param response Response the browser receives
 * @throws When the environment misses a variable of its `APP_ENV` variant
 */
export const clearLoginFlow = (response: NextResponse): void => {
    const { names, secure } = getSessionCookieConfig()
    response.cookies.delete({ name: names.flow, path: "/", secure })
}
