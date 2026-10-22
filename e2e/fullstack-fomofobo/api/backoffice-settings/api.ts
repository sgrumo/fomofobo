import { BackofficeSettingsRoutes } from "api-routes"

import { createApiCall } from "../api"

export const getSettings = createApiCall(BackofficeSettingsRoutes.get)
export const updateSettings = createApiCall(BackofficeSettingsRoutes.update)
