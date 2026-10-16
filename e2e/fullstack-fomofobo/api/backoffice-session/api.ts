import { BackofficeSessionRoutes } from "api-routes"

import { createApiCall } from "../api"

export const getMe = createApiCall(BackofficeSessionRoutes.me)
