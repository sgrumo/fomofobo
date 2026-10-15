import { defaultLanguage, languageKeys } from "i18n/i18n"
import type { Redirect } from "next/dist/lib/load-custom-routes"

const supported = languageKeys.join("|")
const outsideLanguage = ["api", "auth", "_next"].join("|")

/**
 * @remarks In order: the bare root, an unsupported two-letter language (replaced), any
 * other first segment (prefixed). Skips the route handlers, the Next assets and every
 * path holding a dot
 */
export const languageRedirects: Redirect[] = [
    {
        source: "/",
        destination: `/${defaultLanguage}`,
        permanent: false,
    },
    {
        source: `/:lang((?!(?:${supported})(?:/|$))[a-z]{2})/:path*`,
        destination: `/${defaultLanguage}/:path*`,
        permanent: false,
    },
    {
        source: `/:first((?!(?:${supported}|${outsideLanguage})(?:/|$))(?!.*\\.)[^/]+)/:rest*`,
        destination: `/${defaultLanguage}/:first/:rest*`,
        permanent: false,
    },
]
