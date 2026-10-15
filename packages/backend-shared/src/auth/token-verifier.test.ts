import { createServer } from "node:http"
import type { Server } from "node:http"

import type { CryptoKey } from "jose"
import { exportJWK, generateKeyPair, SignJWT } from "jose"
import { afterAll, describe, expect, it } from "vitest"

import { createTokenVerifier, TokenVerificationError } from "./token-verifier"

const keyId = "test-key"
const audience = "fomofobo-api"
/** The issuer carries a path, the shape a mock provider and a tenant both use. */
const issuerPath = "/default"

interface Provider {
    issuer: string
    signToken: (claims: {
        subject?: string
        issuer?: string
        audience?: string
        expiresIn?: string
    }) => Promise<string>
    close: () => Promise<void>
}

/**
 * @description Starts a provider serving its metadata and its key set over HTTP
 * @remarks Serves a real key set instead of a stub, so the discovery call and the
 * signature check both run the path a deployed instance takes
 */
const startProvider = async (): Promise<Provider> => {
    const { publicKey, privateKey } = await generateKeyPair("RS256", {
        extractable: true,
    })
    const jwk = await exportJWK(publicKey)

    const server: Server = createServer((req, res) => {
        const path = req.url ?? "/"
        res.setHeader("Content-Type", "application/json")

        if (path.endsWith("/.well-known/openid-configuration")) {
            res.end(JSON.stringify({ jwks_uri: `${baseUrl}/jwks` }))
            return
        }
        if (path === "/jwks") {
            res.end(JSON.stringify({ keys: [{ ...jwk, kid: keyId, alg: "RS256" }] }))
            return
        }

        res.statusCode = 404
        res.end("{}")
    })

    await new Promise<void>(resolve => {
        server.listen(0, "127.0.0.1", resolve)
    })

    const address = server.address()
    const port = typeof address === "object" && address !== null ? address.port : 0
    const baseUrl = `http://127.0.0.1:${String(port)}`

    const signToken = async (claims: {
        subject?: string
        issuer?: string
        audience?: string
        expiresIn?: string
    }): Promise<string> =>
        await new SignJWT({})
            .setProtectedHeader({ alg: "RS256", kid: keyId })
            .setIssuer(claims.issuer ?? `${baseUrl}${issuerPath}`)
            .setAudience(claims.audience ?? audience)
            .setSubject(claims.subject ?? "user-1")
            .setIssuedAt()
            .setExpirationTime(claims.expiresIn ?? "5m")
            .sign(privateKey satisfies CryptoKey)

    return {
        issuer: `${baseUrl}${issuerPath}`,
        signToken,
        close: async (): Promise<void> => {
            await new Promise<void>(resolve => {
                server.close(() => {
                    resolve()
                })
            })
        },
    }
}

const provider = await startProvider()

describe("createTokenVerifier", () => {
    afterAll(async () => {
        await provider.close()
    })

    // The provider of this suite speaks plain HTTP, so the verifier opts in here.
    const buildVerifier = () =>
        createTokenVerifier({ issuer: provider.issuer, audience, allowInsecure: true })

    it("accepts a token the provider signed and returns its identity", async () => {
        const token = await provider.signToken({ subject: "user-42" })

        const verified = await buildVerifier().verify(token)

        expect(verified.subject).toBe("user-42")
        expect(verified.claims.aud).toBe(audience)
    })

    it("resolves the key set through discovery, then reuses it", async () => {
        const verifier = buildVerifier()

        const first = await verifier.verify(await provider.signToken({}))
        const second = await verifier.verify(await provider.signToken({}))

        expect(first.subject).toBe(second.subject)
    })

    it("refuses an expired token", async () => {
        const token = await provider.signToken({ expiresIn: "-1h" })

        await expect(buildVerifier().verify(token)).rejects.toBeInstanceOf(
            TokenVerificationError,
        )
    })

    it("refuses a token minted for another audience", async () => {
        const token = await provider.signToken({ audience: "another-api" })

        await expect(buildVerifier().verify(token)).rejects.toBeInstanceOf(
            TokenVerificationError,
        )
    })

    it("refuses a token minted by another issuer", async () => {
        const token = await provider.signToken({ issuer: "https://evil.example.com" })

        await expect(buildVerifier().verify(token)).rejects.toBeInstanceOf(
            TokenVerificationError,
        )
    })

    it("refuses a malformed token", async () => {
        await expect(buildVerifier().verify("not-a-jwt")).rejects.toBeInstanceOf(
            TokenVerificationError,
        )
    })

    it("reports an unreachable provider as unavailable, instead of hanging", async () => {
        const verifier = createTokenVerifier({
            issuer: "http://127.0.0.1:1/nowhere",
            audience,
            allowInsecure: true,
        })

        await expect(verifier.verify("not-a-jwt")).rejects.toMatchObject({
            name: "TokenVerificationError",
            reason: "unavailable",
        })
    })

    it("reports a bad token as invalid, so a caller knows a new login is the answer", async () => {
        const token = await provider.signToken({ audience: "another-api" })

        await expect(buildVerifier().verify(token)).rejects.toMatchObject({
            reason: "invalid",
        })
    })

    it("refuses a plain-HTTP issuer unless the caller opts in", () => {
        // A key set fetched in the clear is one an on-path attacker can replace.
        expect(() => createTokenVerifier({ issuer: provider.issuer, audience })).toThrow(
            "must be an https:// URL",
        )
        expect(() =>
            createTokenVerifier({
                issuer: "https://auth.example.com",
                audience,
                jwksUrl: "http://keys.example.com/jwks",
            }),
        ).toThrow("must be an https:// URL")
    })
})
