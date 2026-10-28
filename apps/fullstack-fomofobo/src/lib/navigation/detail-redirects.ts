import { languageKeys } from "i18n/i18n"
import type { Redirect } from "next/dist/lib/load-custom-routes"

const supported = languageKeys.join("|")

/**
 * @remarks The event and venue pages of earlier links open the map with the detail open, the
 * query of the request kept
 */
export const detailRedirects: Redirect[] = [
    {
        source: `/:lang(${supported})/events/:eventId/:date`,
        destination: "/:lang?event=:eventId&occurrence=:date&detail=true",
        permanent: true,
    },
    {
        source: `/:lang(${supported})/venues/:venueId`,
        destination: "/:lang?venue=:venueId&detail=true",
        permanent: true,
    },
]
