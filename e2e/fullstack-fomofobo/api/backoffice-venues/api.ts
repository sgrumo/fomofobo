import { BackofficeVenuesRoutes } from "api-routes"

import { createApiCall } from "../api"

export const listVenues = createApiCall(BackofficeVenuesRoutes.list)
export const getVenue = createApiCall(BackofficeVenuesRoutes.getById)
export const createVenue = createApiCall(BackofficeVenuesRoutes.create)
export const updateVenue = createApiCall(BackofficeVenuesRoutes.update)
