import type {
    BackofficeEventsRoutes,
    BackofficeOrganizersRoutes,
    BackofficeVenuesRoutes,
    PublicRoutes,
} from "api-routes"

import type { QueryVariables } from "./client"

export const specifier = {
    detail: "detail",
    list: "list",
    lookup: "lookup",
    saves: "saves",
    search: "search",
}

export const cacheKey = {
    publicOccurrences: "publicOccurrences",
    publicVenues: "publicVenues",
    places: "places",
    categories: "categories",
    me: "me",
    backofficeEvents: "backofficeEvents",
    venues: "venues",
    organizers: "organizers",
    clientCompatibility: "clientCompatibility",
    settings: "settings",
}

/**
 * @remarks Every specific key starts with its `all*` prefix, enabling prefix invalidation
 */
export const cacheKeys = (() => {
    const basePublicOccurrences = [cacheKey.publicOccurrences]
    const basePublicVenues = [cacheKey.publicVenues]
    const basePlaces = [cacheKey.places]
    const baseCategories = [cacheKey.categories]
    const baseMe = [cacheKey.me]
    const baseBackofficeEvents = [cacheKey.backofficeEvents]
    const baseVenues = [cacheKey.venues]
    const baseOrganizers = [cacheKey.organizers]
    const baseClientCompatibility = [cacheKey.clientCompatibility]
    const baseSettings = [cacheKey.settings]

    const publicOccurrenceSearch = (
        variables: QueryVariables<typeof PublicRoutes.searchOccurrences>,
    ) => [...basePublicOccurrences, specifier.search, variables]
    const publicOccurrenceLookup = (
        variables: QueryVariables<typeof PublicRoutes.lookupOccurrences>,
    ) => [...basePublicOccurrences, specifier.lookup, variables]
    const publicOccurrence = (
        variables: QueryVariables<typeof PublicRoutes.getOccurrence>,
    ) => [...basePublicOccurrences, specifier.detail, variables]
    const publicVenue = (variables: QueryVariables<typeof PublicRoutes.getVenue>) => [
        ...basePublicVenues,
        specifier.detail,
        variables,
    ]
    const publicVenueHistory = (
        variables: QueryVariables<typeof PublicRoutes.listVenueHistory>,
    ) => [...basePublicVenues, specifier.list, variables]
    const placeSearch = (variables: QueryVariables<typeof PublicRoutes.searchPlaces>) => [
        ...basePlaces,
        variables,
    ]
    const backofficeEventList = (
        variables: QueryVariables<typeof BackofficeEventsRoutes.list>,
    ) => [...baseBackofficeEvents, specifier.list, variables]
    const backofficeEvent = (
        variables: QueryVariables<typeof BackofficeEventsRoutes.getById>,
    ) => [...baseBackofficeEvents, specifier.detail, variables]
    const backofficeEventSaveCounts = (
        variables: QueryVariables<typeof BackofficeEventsRoutes.listSaveCounts>,
    ) => [...baseBackofficeEvents, specifier.saves, variables]
    const venueList = (variables: QueryVariables<typeof BackofficeVenuesRoutes.list>) => [
        ...baseVenues,
        specifier.list,
        variables,
    ]
    const venue = (variables: QueryVariables<typeof BackofficeVenuesRoutes.getById>) => [
        ...baseVenues,
        specifier.detail,
        variables,
    ]
    const organizerList = (
        variables: QueryVariables<typeof BackofficeOrganizersRoutes.list>,
    ) => [...baseOrganizers, specifier.list, variables]
    const organizer = (
        variables: QueryVariables<typeof BackofficeOrganizersRoutes.getById>,
    ) => [...baseOrganizers, specifier.detail, variables]

    return {
        allPublicOccurrences: basePublicOccurrences,
        allPublicVenues: basePublicVenues,
        allPlaces: basePlaces,
        allBackofficeEvents: baseBackofficeEvents,
        allVenues: baseVenues,
        allOrganizers: baseOrganizers,
        // One query each with no variable, so the base array is the whole key.
        allCategories: baseCategories,
        me: baseMe,
        allClientCompatibility: baseClientCompatibility,
        settings: baseSettings,
        publicOccurrenceSearch,
        publicOccurrenceLookup,
        publicOccurrence,
        publicVenue,
        publicVenueHistory,
        placeSearch,
        backofficeEventList,
        backofficeEvent,
        backofficeEventSaveCounts,
        venueList,
        venue,
        organizerList,
        organizer,
    } as const
})()

/**
 * @remarks Invalidates the backoffice events on a venue or organizer write, since the
 * event list shows both names
 */
export const writeInvalidations = {
    event: [cacheKeys.allBackofficeEvents],
    category: [cacheKeys.allCategories],
    venue: [cacheKeys.allVenues, cacheKeys.allBackofficeEvents],
    organizer: [cacheKeys.allOrganizers, cacheKeys.allBackofficeEvents],
    settings: [cacheKeys.settings],
}
