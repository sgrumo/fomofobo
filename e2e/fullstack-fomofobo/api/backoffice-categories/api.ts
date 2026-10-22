import { BackofficeCategoriesRoutes } from "api-routes"

import { createApiCall } from "../api"

export const createCategory = createApiCall(BackofficeCategoriesRoutes.create)
export const updateCategory = createApiCall(BackofficeCategoriesRoutes.update)
export const deleteCategory = createApiCall(BackofficeCategoriesRoutes.delete)
export const createCategoryImageUploadTicket = createApiCall(
    BackofficeCategoriesRoutes.createImageUploadTicket,
)
