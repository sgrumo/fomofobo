import "server-only"
import { defaultLanguage } from "i18n/i18n"
import { Result } from "shared/result"

import { routes } from "@/framework/routes/routes"

/**
 * @description Returns a path of this application, or the root for anything else
 * @param candidate Value read from the `returnTo` query parameter
 * @param baseUrl Origin this app answers on
 * @remarks Resolves the candidate and compares the origin of the result, instead of
 * reading the string. A value the visitor controls reaches a redirect here, and the URL
 * parser maps `\` to `/` for an http base: `/\evil.example.com` reads as a path and
 * resolves to another origin, which no prefix check catches
 */
export const sanitizeReturnPath = (candidate: string | null, baseUrl: string): string => {
    const rootPath = routes.root.path({
        parameters: { lang: defaultLanguage },
        query: {},
    })
    if (candidate === null) {
        return rootPath
    }

    const resolved = Result.try(() => new URL(candidate, baseUrl))
    const base = Result.try(() => new URL(baseUrl))
    if (!resolved.success || !base.success) {
        return rootPath
    }

    return resolved.value.origin === base.value.origin
        ? `${resolved.value.pathname}${resolved.value.search}`
        : rootPath
}
