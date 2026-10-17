import { BackofficeEventsRoutes } from "api-routes"

import { createApiCall } from "../api"

export const listEvents = createApiCall(BackofficeEventsRoutes.list)
export const getEvent = createApiCall(BackofficeEventsRoutes.getById)
export const createEvent = createApiCall(BackofficeEventsRoutes.create)
export const updateEvent = createApiCall(BackofficeEventsRoutes.update)
export const deleteEvent = createApiCall(BackofficeEventsRoutes.delete)
export const blockEvent = createApiCall(BackofficeEventsRoutes.block)
export const unblockEvent = createApiCall(BackofficeEventsRoutes.unblock)
export const createPhotoUploadTicket = createApiCall(
    BackofficeEventsRoutes.createPhotoUploadTicket,
)
