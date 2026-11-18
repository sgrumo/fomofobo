import { languageKeys } from "i18n/i18n"
import type { Redirect } from "next/dist/lib/load-custom-routes"

const supported = languageKeys.join("|")

/**
 * @remarks The event and venue pages of earlier links, and the shared links of the map that
 * opened at the language root, open the map with the detail open, the query of the request kept
 */
export const detailRedirects: Redirect[] = [
    {
        source: `/:lang(${supported})/events/:eventId/:date`,
        destination: "/:lang/map?event=:eventId&occurrence=:date&detail=true",
        permanent: true,
    },
    {
        source: `/:lang(${supported})/venues/:venueId`,
        destination: "/:lang/map?venue=:venueId&detail=true",
        permanent: true,
    },
    {
        source: `/:lang(${supported})`,
        has: [{ type: "query", key: "event" }],
        destination: "/:lang/map",
        permanent: true,
    },
    {
        source: `/:lang(${supported})`,
        has: [{ type: "query", key: "venue" }],
        destination: "/:lang/map",
        permanent: true,
    },
]
