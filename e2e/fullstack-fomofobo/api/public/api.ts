import { PublicRoutes } from "api-routes"

import { createApiCall } from "../api"

export const listCategories = createApiCall(PublicRoutes.listCategories)
export const searchOccurrences = createApiCall(PublicRoutes.searchOccurrences)
export const lookupOccurrences = createApiCall(PublicRoutes.lookupOccurrences)
export const getOccurrence = createApiCall(PublicRoutes.getOccurrence)
export const searchPlaces = createApiCall(PublicRoutes.searchPlaces)
export const getPublicVenue = createApiCall(PublicRoutes.getVenue)
export const listVenueHistory = createApiCall(PublicRoutes.listVenueHistory)
