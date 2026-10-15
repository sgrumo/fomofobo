import { Hono } from "hono"
import { describe, expect, it } from "vitest"

import { serializeError } from "../http/app-error"
import { createAuthMiddleware, getAuth } from "./auth-middleware"
import type { TokenVerifier } from "./token-verifier"
import { TokenVerificationError } from "./token-verifier"

const validToken = "token-ok"
const cookieName = "session-access"

/**
 * @description Returns a verifier that accepts one token and fails every other one
 * @param failure Reason of every other token
 */
const stubVerifier = (failure: "invalid" | "unavailable"): TokenVerifier => ({
    verify: token => {
        if (token === validToken) {
            return Promise.resolve({ subject: "user-1", claims: { sub: "user-1" } })
        }
        return Promise.reject(new TokenVerificationError(failure, "nope"))
    },
})

/**
 * @description Builds an app that echoes the subject behind the middleware
 * @param failure Reason the verifier reports for a bad token
 */
const buildApp = (failure: "invalid" | "unavailable" = "invalid") => {
    const app = new Hono()
    app.use(
        createAuthMiddleware({
            verifier: stubVerifier(failure),
            unauthenticatedCode: "Unauthenticated",
            unavailableCode: "ProviderUnavailable",
            cookieName,
            publicPaths: ["/health"],
        }),
    )
    // The serialized error carries the code the middleware chose, with no branch here.
    app.onError((error, c) => c.json(serializeError(error), 500))
    app.get("/health", c => c.text("ok"))
    app.get("/me", c => c.json({ subject: getAuth(c).subject }))
    app.post("/me", c => c.json({ subject: getAuth(c).subject }))
    return app
}

describe("createAuthMiddleware", () => {
    it("should leave a public path open", async () => {
        const res = await buildApp().request("/health")

        expect(res.status).toBe(200)
    })

    it("should refuse a request with no token", async () => {
        const res = await buildApp().request("/me")

        expect(await res.json()).toMatchObject({
            code: "Unauthenticated",
            message: "The request carries no access token",
        })
    })

    it("should accept a bearer header and set the identity", async () => {
        const res = await buildApp().request("/me", {
            headers: { Authorization: `Bearer ${validToken}` },
        })

        expect(await res.json()).toStrictEqual({ subject: "user-1" })
    })

    it("should read the scheme without case, as RFC 9110 defines it", async () => {
        const res = await buildApp().request("/me", {
            headers: { Authorization: `bearer ${validToken}` },
        })

        expect(await res.json()).toStrictEqual({ subject: "user-1" })
    })

    it("should accept the cookie on a read", async () => {
        const res = await buildApp().request("/me", {
            headers: { Cookie: `${cookieName}=${validToken}` },
        })

        expect(await res.json()).toStrictEqual({ subject: "user-1" })
    })

    it("should ignore the cookie on a change, which a header must carry", async () => {
        // A cookie rides any request the browser sends, a sibling page included.
        const res = await buildApp().request("/me", {
            method: "POST",
            headers: { Cookie: `${cookieName}=${validToken}` },
        })

        expect(await res.json()).toMatchObject({
            code: "Unauthenticated",
            message: "The request carries no access token",
        })
    })

    it("should raise the unauthenticated code on an invalid token", async () => {
        const res = await buildApp("invalid").request("/me", {
            headers: { Authorization: "Bearer forged" },
        })

        expect(await res.json()).toMatchObject({
            code: "Unauthenticated",
            message: "nope",
        })
    })

    it("should raise the unavailable code when the provider is down", async () => {
        const res = await buildApp("unavailable").request("/me", {
            headers: { Authorization: "Bearer whatever" },
        })

        expect(await res.json()).toMatchObject({ code: "ProviderUnavailable" })
    })
})
