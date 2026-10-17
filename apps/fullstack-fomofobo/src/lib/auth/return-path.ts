import { Result } from "shared/result"

import { routes } from "@/framework/routes/routes"

const BACKOFFICE_PATH = routes.backoffice.path({ parameters: {}, query: {} })
export const BACKOFFICE_HOME_PATH = routes.backofficeEvents.path({
    parameters: {},
    query: {},
})

/** Origin the candidate resolves against. It is never served: only the comparison reads it. */
const resolutionBase = new URL("http://return-path.invalid")

/**
 * @description Returns a backoffice path of this application, or the events list for anything else
 * @param candidate Value read from the `returnTo` query parameter
 * @remarks Resolves the candidate and compares the origin of the result, instead of
 * reading the string. The URL parser maps `\` to `/` for an http base, so
 * `/\evil.example.com` reads as a path and resolves to another origin, which no
 * prefix check catches
 */
export const sanitizeReturnPath = (candidate: string | undefined): string => {
    if (candidate === undefined) {
        return BACKOFFICE_HOME_PATH
    }

    const resolved = Result.try(() => new URL(candidate, resolutionBase))
    if (!resolved.success || resolved.value.origin !== resolutionBase.origin) {
        return BACKOFFICE_HOME_PATH
    }

    const { pathname, search } = resolved.value
    return pathname === BACKOFFICE_PATH || pathname.startsWith(`${BACKOFFICE_PATH}/`)
        ? `${pathname}${search}`
        : BACKOFFICE_HOME_PATH
}

/**
 * @description Builds the path of the login page that returns to the path after the sign-in
 * @param returnTo Path the visitor asked for, none for the events list
 * @param reason Why the session ended, shown on the login page
 */
export const buildLoginPath = (returnTo?: string, reason?: "blocked"): string =>
    routes.backofficeLogin.path({ parameters: {}, query: { returnTo, reason } })
