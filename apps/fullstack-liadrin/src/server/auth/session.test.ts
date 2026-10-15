import { NextResponse } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    clearSessionCookies,
    parseLoginFlow,
    writeLoginFlow,
    writeSessionCookies,
} from "./session"

/**
 * @description Returns the `Set-Cookie` headers of the response
 * @param response Response the writers acted on
 */
const setCookieHeaders = (response: NextResponse): string[] =>
    response.headers.getSetCookie()

/**
 * @description Returns the header naming the cookie
 * @param response Response the writers acted on
 * @param name Cookie read
 */
const headerOf = (response: NextResponse, name: string): string =>
    setCookieHeaders(response).find(header => header.startsWith(`${name}=`)) ?? ""

describe("session cookies", () => {
    describe("on a deployed shape, where the names carry the __Host- prefix", () => {
        beforeEach(() => {
            vi.stubEnv("APP_ENV", "docker")
            vi.stubEnv("PGHOST", "postgres")
            vi.stubEnv("PGUSER", "postgres")
            vi.stubEnv("PGPASSWORD", "secret")
            vi.stubEnv("PGDATABASE", "postgres")
            vi.stubEnv("PGPORT", "5432")
            vi.stubEnv("S3_ENDPOINT", "https://s3.example.com")
            vi.stubEnv("S3_ACCESS_KEY", "access")
            vi.stubEnv("S3_SECRET_KEY", "secret")
            vi.stubEnv("OIDC_ISSUER", "https://auth.example.com/realms/app")
            vi.stubEnv("OIDC_CLIENT_ID", "fomofobo")
            vi.stubEnv("OIDC_AUDIENCE", "fomofobo-api")
            vi.stubEnv("APP_BASE_URL", "https://app.example.com")
        })

        it("should write every cookie Secure, HttpOnly and SameSite=Lax", () => {
            const response = new NextResponse(null)

            writeSessionCookies(response, {
                accessToken: "access",
                refreshToken: "refresh",
                idToken: "id",
            })

            const header = headerOf(response, "__Host-fomofobo-access")
            expect(header).toContain("Secure")
            expect(header).toContain("HttpOnly")
            expect(header).toContain("SameSite=lax")
            expect(header).toContain("Path=/")
        })

        it("should delete every cookie with the attributes the prefix requires", () => {
            // A browser drops a `__Host-` deletion that carries no `Secure` and no
            // `Path=/`, and the session then survives the sign-out.
            const response = new NextResponse(null)

            clearSessionCookies(response)

            for (const name of ["access", "refresh", "id", "flow"]) {
                const header = headerOf(response, `__Host-fomofobo-${name}`)
                expect(header).toContain("Secure")
                expect(header).toContain("Path=/")
            }
        })
    })

    describe("on a development shape, which answers over plain HTTP", () => {
        beforeEach(() => {
            vi.stubEnv("APP_ENV", "local")
        })

        it("should write no Secure flag, which Chromium refuses on localhost", () => {
            const response = new NextResponse(null)

            writeSessionCookies(response, {
                accessToken: "access",
                refreshToken: undefined,
                idToken: undefined,
            })

            const header = headerOf(response, "fomofobo-access")
            expect(header).not.toContain("Secure")
            expect(header).toContain("HttpOnly")
        })

        it("should write only the cookies the provider answered with", () => {
            const response = new NextResponse(null)

            writeSessionCookies(response, {
                accessToken: "access",
                refreshToken: undefined,
                idToken: undefined,
            })

            expect(setCookieHeaders(response)).toHaveLength(1)
        })
    })
})

/**
 * @description Returns the value of the flow cookie a response set
 * @param response Response the writer acted on
 * @remarks Plays the browser: what one response sets, the next request carries
 */
const flowCookieOf = (response: NextResponse): string | undefined =>
    response.cookies.get("fomofobo-flow")?.value

describe("login flow cookie", () => {
    beforeEach(() => {
        vi.stubEnv("APP_ENV", "local")
    })

    it("should read back the verifier, the state and the return path it wrote", () => {
        const response = new NextResponse(null)
        writeLoginFlow(response, { verifier: "v-1", state: "s-1", returnTo: "/todos" })

        expect(parseLoginFlow(flowCookieOf(response))).toStrictEqual({
            verifier: "v-1",
            state: "s-1",
            returnTo: "/todos",
        })
    })

    it("should read nothing when no round trip started", () => {
        expect(parseLoginFlow(undefined)).toBeUndefined()
    })

    it("should read nothing from a body this app did not write", () => {
        // A planted cookie ends the flow instead of driving it.
        expect(parseLoginFlow("not-json")).toBeUndefined()
        expect(
            parseLoginFlow(JSON.stringify({ verifier: "v", state: 1 })),
        ).toBeUndefined()
        expect(
            parseLoginFlow(JSON.stringify({ verifier: "", state: "s", returnTo: "/" })),
        ).toBeUndefined()
    })

    it("should give the flow cookie a short life and keep it off the browser", () => {
        const response = new NextResponse(null)
        writeLoginFlow(response, { verifier: "v-1", state: "s-1", returnTo: "/" })

        const header = response.headers
            .getSetCookie()
            .find(h => h.startsWith("fomofobo-flow="))
        expect(header).toContain("Max-Age=600")
        expect(header).toContain("HttpOnly")
        expect(header).toContain("SameSite=lax")
    })
})
