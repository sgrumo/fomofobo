import { PublicRoutes } from "api-routes"

import { createApiCall } from "../api"

export const listCategories = createApiCall(PublicRoutes.listCategories)
