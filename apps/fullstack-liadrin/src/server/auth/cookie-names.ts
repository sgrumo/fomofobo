import "server-only"
import { resolveAppConfig } from "../config/app-config"
import { parseEnv } from "../config/env"

export interface SessionCookieNames {
    access: string
    refresh: string
    idToken: string
    flow: string
}

/**
 * @description Returns the cookie names of one environment
 * @param secure True where the app answers over HTTPS
 * @remarks Prefixes every name with `__Host-` where the cookies are `Secure`. The
 * prefix binds a cookie to this exact host and forbids a `Domain`, so a neighbour
 * subdomain cannot plant one. Chromium refuses the prefix on `http://localhost`,
 * where dev and the E2E suite both run
 */
export const buildSessionCookieNames = (secure: boolean): SessionCookieNames => {
    const prefix = secure ? "__Host-" : ""
    return {
        access: `${prefix}fomofobo-access`,
        refresh: `${prefix}fomofobo-refresh`,
        idToken: `${prefix}fomofobo-id`,
        flow: `${prefix}fomofobo-flow`,
    }
}

/**
 * @description Returns the cookie names and settings of this environment
 * @throws When the environment misses a variable of its `APP_ENV` variant
 * @remarks Holds no import of `next/headers`, so the Hono application reads the name of
 * the access cookie without pulling the request context of a page into its graph
 */
export const getSessionCookieConfig = (): {
    names: SessionCookieNames
    secure: boolean
} => {
    const { secureCookies } = resolveAppConfig(parseEnv(process.env).APP_ENV)
    return { names: buildSessionCookieNames(secureCookies), secure: secureCookies }
}
