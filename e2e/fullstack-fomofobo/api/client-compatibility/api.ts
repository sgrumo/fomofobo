import { ClientCompatibilityRoutes } from "api-routes"

import { createApiCall } from "../api"

export const checkClientCompatibility = createApiCall(ClientCompatibilityRoutes.check)
