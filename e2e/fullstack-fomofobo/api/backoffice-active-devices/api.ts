import { BackofficeActiveDevicesRoutes } from "api-routes"

import { createApiCall } from "../api"

export const getActiveDevices = createApiCall(BackofficeActiveDevicesRoutes.get)
