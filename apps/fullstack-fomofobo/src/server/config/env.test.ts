import { describe, expect, it } from "vitest"

import { parseEnv } from "./env"

const dockerEnv = {
    APP_ENV: "docker",
    S3_ENDPOINT: "https://s3.example.com",
    S3_ACCESS_KEY: "access",
    S3_SECRET_KEY: "secret",
    OIDC_ISSUER: "https://auth.example.com/realms/app",
    OIDC_CLIENT_ID: "fomofobo",
    OIDC_AUDIENCE: "fomofobo-api",
    APP_BASE_URL: "https://app.example.com",
}

describe("parseEnv", () => {
    it("should read an unset APP_ENV as local outside a deployed build", () => {
        expect(parseEnv({}).APP_ENV).toBe("local")
    })

    it("should apply the local defaults", () => {
        const env = parseEnv({})

        expect(env.S3_BUCKET).toBe("fomofobo")
    })

    it("should reject an unset APP_ENV on Vercel", () => {
        expect(() => parseEnv({ VERCEL: "1" })).toThrow('APP_ENV="<unset>"')
    })

    it("should read an unset APP_ENV as local in a production build off Vercel", () => {
        // `next start` needs a production build everywhere, so NODE_ENV says nothing
        // about where the app runs.
        expect(parseEnv({ NODE_ENV: "production" }).APP_ENV).toBe("local")
    })

    it("should accept the shape the E2E suite runs: a production build with APP_ENV=test", () => {
        expect(parseEnv({ NODE_ENV: "production", APP_ENV: "test" }).APP_ENV).toBe("test")
    })

    it("should reject a development shape set by hand on Vercel", () => {
        expect(() => parseEnv({ VERCEL: "1", APP_ENV: "local" })).toThrow(
            'APP_ENV="local" on Vercel',
        )
        expect(() => parseEnv({ VERCEL: "1", APP_ENV: "test" })).toThrow(
            'APP_ENV="test" on Vercel',
        )
    })

    it("should parse the docker variant", () => {
        const env = parseEnv(dockerEnv)

        expect(env.APP_ENV).toBe("docker")
    })

    it("should apply the local OIDC defaults, which name the mock provider", () => {
        const env = parseEnv({})

        expect(env.OIDC_ISSUER).toBe("http://localhost:8090/default")
        expect(env.OIDC_SCOPE).toContain("openid")
        expect(env.APP_BASE_URL).toBe("http://localhost:3000")
    })

    it("should read no client secret as a public client", () => {
        expect(parseEnv({}).OIDC_CLIENT_SECRET).toBeUndefined()
        expect(parseEnv({ OIDC_CLIENT_SECRET: "" }).OIDC_CLIENT_SECRET).toBeUndefined()
        expect(parseEnv({ OIDC_CLIENT_SECRET: "shh" }).OIDC_CLIENT_SECRET).toBe("shh")
    })

    it("should drop the trailing slash of the base URL", () => {
        expect(parseEnv({ APP_BASE_URL: "http://localhost:3000/" }).APP_BASE_URL).toBe(
            "http://localhost:3000",
        )
    })

    it("should require the OIDC variables of a deployed shape", () => {
        const { OIDC_ISSUER: _unused, ...withoutIssuer } = dockerEnv

        expect(() => parseEnv(withoutIssuer)).toThrow("OIDC_ISSUER: not set")
    })

    it("should read the base URL of a Vercel deploy from the production domain", () => {
        const { APP_BASE_URL: _unused, ...withoutBaseUrl } = dockerEnv

        const env = parseEnv({
            ...withoutBaseUrl,
            APP_ENV: "vercel",
            VERCEL: "1",
            VERCEL_PROJECT_PRODUCTION_URL: "app.vercel.app",
            S3_BUCKET: "fomofobo",
            S3_REGION: "eu-west-1",
        })

        expect(env.APP_BASE_URL).toBe("https://app.vercel.app")
    })

    it("should reject a variable that is set but empty", () => {
        expect(() => parseEnv({ ...dockerEnv, S3_SECRET_KEY: "" })).toThrow(
            "S3_SECRET_KEY: set but empty",
        )
    })

    it("should reject a missing variable of the variant", () => {
        const { S3_ACCESS_KEY: _unused, ...withoutAccessKey } = dockerEnv

        expect(() => parseEnv(withoutAccessKey)).toThrow("S3_ACCESS_KEY: not set")
    })

    it("should reject an S3 endpoint without a scheme", () => {
        expect(() => parseEnv({ ...dockerEnv, S3_ENDPOINT: "s3.example.com" })).toThrow(
            "must be a full URL",
        )
    })

    it("should require every object store variable on Vercel", () => {
        expect(() =>
            parseEnv({
                ...dockerEnv,
                APP_ENV: "vercel",
                S3_BUCKET: "",
            }),
        ).toThrow("S3_BUCKET")
    })
})
