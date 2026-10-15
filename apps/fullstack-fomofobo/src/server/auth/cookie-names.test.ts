import { describe, expect, it } from "vitest"

import { buildSessionCookieNames } from "./cookie-names"

describe("buildSessionCookieNames", () => {
    /**
     * @description Lists the cookie names of one environment
     * @param secure True where the app answers over HTTPS
     */
    const listNames = (secure: boolean): string[] => {
        const names = buildSessionCookieNames(secure)
        return [names.access, names.refresh, names.idToken, names.flow]
    }

    it("should prefix every name where the cookies are Secure", () => {
        expect(listNames(true).every(name => name.startsWith("__Host-"))).toBe(true)
    })

    it("should drop the prefix where the app answers over plain HTTP", () => {
        // Chromium refuses a `__Host-` cookie on `http://localhost`, which is where
        // dev and the E2E suite both run.
        expect(listNames(false).some(name => name.includes("__Host-"))).toBe(false)
        expect(buildSessionCookieNames(false).access).toBe("fomofobo-access")
    })

    it("should name one cookie per token, so no read collides with another", () => {
        const names = listNames(false)

        expect(new Set(names).size).toBe(names.length)
    })
})
