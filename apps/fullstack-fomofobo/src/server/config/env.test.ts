import { describe, expect, it } from "vitest"

import { parseEnv } from "./env"

const vercelEnv = {
    APP_ENV: "vercel",
    S3_BUCKET: "fomofobo",
    S3_ENDPOINT: "https://account.r2.cloudflarestorage.com",
    S3_ACCESS_KEY: "access",
    S3_SECRET_KEY: "secret",
    OIDC_ISSUER: "https://auth.example.com/realms/app",
    OIDC_CLIENT_ID: "fomofobo",
    OIDC_AUDIENCE: "fomofobo-api",
    APP_BASE_URL: "https://app.example.com",
    DATABASE_URL: "libsql://fomofobo-dev-example.aws-eu-west-1.turso.io",
    DATABASE_AUTH_TOKEN: "token",
    BETTER_AUTH_SECRET: "a-deployed-secret-of-at-least-32-characters",
}

describe("parseEnv", () => {
    it("should read an unset APP_ENV as local under Node", () => {
        expect(parseEnv({}, false).APP_ENV).toBe("local")
    })

    it("should reject an unset APP_ENV on Vercel", () => {
        expect(() => parseEnv({}, true)).toThrow('APP_ENV="<unset>"')
    })

    it("should accept a development shape set by hand on Vercel", () => {
        expect(parseEnv({ APP_ENV: "local" }, true).APP_ENV).toBe("local")
    })

    it("should apply the local defaults", () => {
        expect(parseEnv({}, false).S3_BUCKET).toBe("fomofobo")
    })

    it("should accept the shape the E2E suite runs: a production build with APP_ENV=test", () => {
        expect(parseEnv({ NODE_ENV: "production", APP_ENV: "test" }, false).APP_ENV).toBe(
            "test",
        )
    })

    it("should parse the vercel variant, with the R2 region by default", () => {
        const env = parseEnv(vercelEnv, true)

        expect(env.APP_ENV).toBe("vercel")
        expect(env.S3_REGION).toBe("auto")
    })

    it("should apply the local OIDC defaults, which name the mock provider", () => {
        const env = parseEnv({}, false)

        expect(env.OIDC_ISSUER).toBe("http://localhost:8090/default")
        expect(env.OIDC_SCOPE).toContain("openid")
        expect(env.APP_BASE_URL).toBe("http://localhost:3000")
    })

    it("should read no client secret as a public client", () => {
        expect(parseEnv({}, false).OIDC_CLIENT_SECRET).toBeUndefined()
        expect(
            parseEnv({ OIDC_CLIENT_SECRET: "" }, false).OIDC_CLIENT_SECRET,
        ).toBeUndefined()
        expect(parseEnv({ OIDC_CLIENT_SECRET: "shh" }, false).OIDC_CLIENT_SECRET).toBe(
            "shh",
        )
    })

    it("should drop the trailing slash of the base URL", () => {
        expect(
            parseEnv({ APP_BASE_URL: "http://localhost:3000/" }, false).APP_BASE_URL,
        ).toBe("http://localhost:3000")
    })

    it("should require the OIDC variables of a deployed shape", () => {
        const { OIDC_ISSUER: _unused, ...withoutIssuer } = vercelEnv

        expect(() => parseEnv(withoutIssuer, true)).toThrow("OIDC_ISSUER: not set")
    })

    it("should default to the local database file, with no token", () => {
        const env = parseEnv({}, false)

        expect(env.DATABASE_URL).toBe("file:../../.data/local.db")
        expect(env.DATABASE_AUTH_TOKEN).toBeUndefined()
    })

    it("should reject a database URL of another scheme", () => {
        expect(() =>
            parseEnv({ DATABASE_URL: "postgres://localhost/fomofobo" }, false),
        ).toThrow("DATABASE_URL")
    })

    it("should require the database token of a deployed shape", () => {
        const { DATABASE_AUTH_TOKEN: _unused, ...withoutToken } = vercelEnv

        expect(() => parseEnv(withoutToken, true)).toThrow("DATABASE_AUTH_TOKEN: not set")
    })

    it("should parse the preview shape with the variables of the vercel shape", () => {
        expect(parseEnv({ ...vercelEnv, APP_ENV: "preview" }, true).APP_ENV).toBe(
            "preview",
        )
    })

    it("should require the auth secret of a deployed shape, with no default", () => {
        const { BETTER_AUTH_SECRET: _unused, ...withoutSecret } = vercelEnv

        expect(() => parseEnv(withoutSecret, true)).toThrow("BETTER_AUTH_SECRET: not set")
    })

    it("should reject an auth secret shorter than 32 characters", () => {
        expect(() =>
            parseEnv({ ...vercelEnv, BETTER_AUTH_SECRET: "short" }, true),
        ).toThrow("BETTER_AUTH_SECRET")
    })

    it("should reject a variable that is set but empty", () => {
        expect(() => parseEnv({ ...vercelEnv, S3_SECRET_KEY: "" }, true)).toThrow(
            "S3_SECRET_KEY: set but empty",
        )
    })

    it("should reject a missing variable of the variant", () => {
        const { S3_BUCKET: _unused, ...withoutBucket } = vercelEnv

        expect(() => parseEnv(withoutBucket, true)).toThrow("S3_BUCKET: not set")
    })

    it("should reject an S3 endpoint without a scheme", () => {
        expect(() =>
            parseEnv(
                { ...vercelEnv, S3_ENDPOINT: "account.r2.cloudflarestorage.com" },
                true,
            ),
        ).toThrow("must be a full URL")
    })
})
