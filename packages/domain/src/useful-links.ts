import type { EventExternalLinks, VenueLinks } from "models"

export type UsefulLinkType = "website" | "instagram" | "facebook"

export interface UsefulLink {
    type: UsefulLinkType
    url: string
}

/**
 * @description Builds the useful links of a venue, website first, without the links it lacks
 * @param links Links of the venue
 */
export const venueUsefulLinksOf = (links: VenueLinks): UsefulLink[] =>
    (
        [
            { type: "website", url: links.websiteUrl },
            { type: "instagram", url: links.instagramUrl },
            { type: "facebook", url: links.facebookUrl },
        ] satisfies Array<{ type: UsefulLinkType; url: string | null }>
    ).flatMap(link => (link.url === null ? [] : [{ type: link.type, url: link.url }]))

/**
 * @description Builds the useful links of an event: the links of its venue, each replaced by the link of the event on the same platform
 * @param eventLinks Instagram and Facebook links of the event
 * @param venueLinks Links of the venue of the event
 */
export const eventUsefulLinksOf = (
    eventLinks: EventExternalLinks,
    venueLinks: VenueLinks,
): UsefulLink[] =>
    venueUsefulLinksOf({
        websiteUrl: venueLinks.websiteUrl,
        instagramUrl: eventLinks.instagramUrl ?? venueLinks.instagramUrl,
        facebookUrl: eventLinks.facebookUrl ?? venueLinks.facebookUrl,
    })
