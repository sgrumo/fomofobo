import "server-only"
import { PublicRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import type { ClockEnv } from "../clock"
import { toApplicationError } from "../errors"
import type { CategoriesService } from "../services/categories-service"

/**
 * @description Builds the router of the public app reads, open to every visitor
 * @param categories Category reads
 */
export const buildPublicRouter = (categories: CategoriesService) => {
    const router = createRouter<ClockEnv>()

    router.openapi(PublicRoutes.listCategories, async c => {
        try {
            return respond(
                c,
                PublicRoutes.listCategories,
                HttpStatus.Ok,
                await categories.list(),
            )
        } catch (error) {
            throw toApplicationError(error, "Error listing the categories")
        }
    })

    return router
}
