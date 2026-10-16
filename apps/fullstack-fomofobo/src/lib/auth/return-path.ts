import { Result } from "shared/result"

// PLACEHOLDER(plan 009): the backoffice pages and their routes
const BACKOFFICE_PATH = "/backoffice"
export const BACKOFFICE_LOGIN_PATH = "/backoffice/login"
const BACKOFFICE_HOME_PATH = "/backoffice/events"

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
export const sanitizeReturnPath = (candidate: string | null): string => {
    if (candidate === null) {
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
 * @param returnTo Path the visitor asked for
 */
export const buildLoginPath = (returnTo: string): string =>
    `${BACKOFFICE_LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`
