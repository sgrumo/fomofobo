import { BackofficeOrganizersRoutes } from "api-routes"

import { createApiCall } from "../api"

export const listOrganizers = createApiCall(BackofficeOrganizersRoutes.list)
export const getOrganizer = createApiCall(BackofficeOrganizersRoutes.getById)
export const createOrganizer = createApiCall(BackofficeOrganizersRoutes.create)
export const blockOrganizer = createApiCall(BackofficeOrganizersRoutes.block)
export const unblockOrganizer = createApiCall(BackofficeOrganizersRoutes.unblock)
export const setOrganizerPassword = createApiCall(BackofficeOrganizersRoutes.setPassword)
