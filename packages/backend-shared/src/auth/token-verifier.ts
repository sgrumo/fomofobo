import { z } from "@hono/zod-openapi"
import type { JWTPayload } from "jose"
import { createRemoteJWKSet, decodeJwt, errors as joseErrors, jwtVerify } from "jose"
import { lazyAsync } from "shared/function"
import { Result } from "shared/result"

/** Identity of one request, as the provider signed it. */
export interface VerifiedToken {
    /** `sub` claim. Names the principal of the request. */
    subject: string
    /** Every claim of the token, for a caller that reads an email or a role. */
    claims: JWTPayload
}

/**
 * Why a token did not verify.
 *
 * - `invalid` — the token itself: signature, issuer, audience, lifetime, shape.
 *   The caller holds no valid credential, and a new login is the answer.
 * - `unavailable` — the provider: metadata or key set unreachable, or too slow.
 *   The token is possibly fine, and a retry is the answer. Reading this one as
 *   `invalid` turns one provider outage into a sign-out of every visitor.
 */
export type TokenVerificationReason = "invalid" | "unavailable"

export class TokenVerificationError extends Error {
    public readonly reason: TokenVerificationReason

    public constructor(
        reason: TokenVerificationReason,
        message: string,
        options?: { cause?: unknown },
    ) {
        super(message, options)
        this.name = "TokenVerificationError"
        this.reason = reason
    }
}

export interface TokenVerifierConfig {
    /** `iss` every token must carry. */
    issuer: string
    /** `aud` every token must carry. */
    audience: string
    /** Key set of the provider. Discovery resolves it when this is absent. */
    jwksUrl?: string
    /** Clock skew tolerated on `exp` and `nbf`. */
    clockToleranceSeconds?: number
    /**
     * Accept an issuer or a key set served over plain HTTP.
     *
     * Off by default: a key set fetched in the clear is a key set an on-path
     * attacker can replace, and a forged token then passes. On for a provider that
     * is a container on `localhost`, and nowhere else.
     */
    allowInsecure?: boolean
}

export interface TokenVerifier {
    /**
     * @description Verifies a token and returns the identity it carries
     * @param token Encoded JWT of the request
     * @throws When the signature, the issuer, the audience or the lifetime fails, or
     * when the provider does not answer. `reason` tells the two apart
     */
    verify: (token: string) => Promise<VerifiedToken>
}

/** Path every OpenID provider serves its metadata on. */
const discoveryPath = "/.well-known/openid-configuration"

/** Tolerance that covers the drift between two hosts that both run NTP. */
const defaultClockToleranceSeconds = 5

/**
 * Deadline of the discovery call, in milliseconds.
 *
 * It matches the one `jose` applies to the key set. Without it a provider that
 * accepts the socket and then stalls holds the first request open, and every later
 * one waits on the same promise.
 */
const discoveryTimeoutMs = 5000

const discoverySchema = z.object({ jwks_uri: z.url() })

/**
 * @description Throws when the URL is not HTTPS and plain HTTP is not allowed
 * @param url URL checked
 * @param label Name of the URL in the message
 * @param allowInsecure True where plain HTTP is accepted
 * @throws When the URL is not HTTPS and plain HTTP is not allowed
 */
const assertSecureUrl = (url: string, label: string, allowInsecure: boolean): void => {
    if (!allowInsecure && !url.startsWith("https://")) {
        throw new Error(
            `${label} must be an https:// URL, got ${url}. A key set fetched over plain HTTP is one an on-path attacker can replace.`,
        )
    }
}

/**
 * @description Fetches the key set URL from the metadata of the provider
 * @param issuer Issuer the metadata belongs to
 * @throws When the provider does not answer, or answers without a `jwks_uri`
 * @remarks Appends the well-known path to the issuer instead of resolving it against
 * the origin, because an issuer can carry a path and the metadata then sits under it
 */
const discoverJwksUrl = async (issuer: string): Promise<string> => {
    const url = `${issuer.replace(/\/$/u, "")}${discoveryPath}`

    const response = await Result.tryAsync(() =>
        fetch(url, { signal: AbortSignal.timeout(discoveryTimeoutMs) }),
    )
    if (!response.success) {
        throw new TokenVerificationError(
            "unavailable",
            `The provider metadata at ${url} is unreachable`,
            { cause: response.error },
        )
    }
    if (!response.value.ok) {
        throw new TokenVerificationError(
            "unavailable",
            `The provider metadata at ${url} answered with status ${String(response.value.status)}`,
        )
    }

    const body = await Result.tryAsync((): Promise<unknown> => response.value.json())
    const metadata = discoverySchema.safeParse(body.success ? body.value : undefined)
    if (!metadata.success) {
        throw new TokenVerificationError(
            "unavailable",
            `The provider metadata at ${url} names no jwks_uri`,
            { cause: metadata.error },
        )
    }

    return metadata.data.jwks_uri
}

/** Resolver of the remote key set, as `jose` builds it. */
type KeySet = ReturnType<typeof createRemoteJWKSet>

/**
 * @description Maps a failure of `jwtVerify` to the reason it stands for
 * @param error Failure raised
 * @remarks Reads every `jose` error as the token's fault, except a key set timeout.
 * Anything else — a failed fetch of the key set, an aborted request — is the
 * provider's, and the token deserves a retry
 */
const reasonOf = (error: unknown): TokenVerificationReason =>
    error instanceof joseErrors.JOSEError && !(error instanceof joseErrors.JWKSTimeout)
        ? "invalid"
        : "unavailable"

/**
 * @description Builds the verifier of one provider
 * @param config Issuer, audience and optional key set URL
 * @throws When the issuer or the key set URL is not HTTPS and `allowInsecure` is off
 * @remarks Keeps one key set per verifier, which `jose` refetches on an unknown key id
 * and caches for ten minutes. Build the verifier once per process, never per request
 */
export const createTokenVerifier = (config: TokenVerifierConfig): TokenVerifier => {
    const allowInsecure = config.allowInsecure ?? false
    assertSecureUrl(config.issuer, "OIDC issuer", allowInsecure)
    if (config.jwksUrl !== undefined) {
        assertSecureUrl(config.jwksUrl, "OIDC key set URL", allowInsecure)
    }

    // Defers the discovery call to the first verified request, so the process boots
    // with the provider still down.
    const resolveKeySet = lazyAsync(async (): Promise<KeySet> => {
        const jwksUrl = config.jwksUrl ?? (await discoverJwksUrl(config.issuer))
        assertSecureUrl(jwksUrl, "The jwks_uri of the provider", allowInsecure)
        return createRemoteJWKSet(new URL(jwksUrl))
    })

    const verify = async (token: string): Promise<VerifiedToken> => {
        const keySet = await resolveKeySet()

        const verified = await Result.tryAsync(() =>
            jwtVerify(token, keySet, {
                issuer: config.issuer,
                audience: config.audience,
                clockTolerance:
                    config.clockToleranceSeconds ?? defaultClockToleranceSeconds,
            }),
        )
        if (!verified.success) {
            const reason = reasonOf(verified.error)
            throw new TokenVerificationError(
                reason,
                reason === "invalid"
                    ? "The token is not valid"
                    : "The key set of the provider is unreachable",
                { cause: verified.error },
            )
        }

        const { sub } = verified.value.payload
        if (sub === undefined) {
            throw new TokenVerificationError("invalid", "The token carries no sub claim")
        }

        return { subject: sub, claims: verified.value.payload }
    }

    return { verify }
}

/**
 * @description Returns the claims of a token without any check on its signature
 * @param token Encoded JWT read
 * @remarks Decides **NO** access with this. Only a verified token can, and
 * `createTokenVerifier` is what verifies one. Use it to read a display name, or to
 * drop a session whose token the provider already expired
 * @remarks Returns `undefined` when the value is not a JWT at all
 */
export const readUnverifiedClaims = (token: string): JWTPayload | undefined => {
    const claims = Result.try(() => decodeJwt(token))
    return claims.success ? claims.value : undefined
}
