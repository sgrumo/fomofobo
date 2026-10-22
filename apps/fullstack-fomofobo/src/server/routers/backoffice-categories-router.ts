import "server-only"
import { BackofficeCategoriesRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import type { BackofficeEnv } from "../auth/backoffice-session"
import { requireRole } from "../auth/backoffice-session"
import { toApplicationError } from "../errors"
import type { CategoriesService } from "../services/categories-service"

/**
 * @description Builds the router of the category writes, Admin only
 * @param categories Category rules and writes
 */
export const buildBackofficeCategoriesRouter = (categories: CategoriesService) => {
    const router = createRouter<BackofficeEnv>()

    const categoriesPath = BackofficeCategoriesRoutes.create.getRoutingPath()
    router.use(categoriesPath, requireRole("admin"))
    router.use(`${categoriesPath}/*`, requireRole("admin"))

    router.openapi(BackofficeCategoriesRoutes.create, async c => {
        try {
            const category = await categories.create(c.req.valid("json"))
            return respond(
                c,
                BackofficeCategoriesRoutes.create,
                HttpStatus.Created,
                category,
            )
        } catch (error) {
            throw toApplicationError(error, "Error creating the category")
        }
    })

    router.openapi(BackofficeCategoriesRoutes.update, async c => {
        try {
            const category = await categories.update(
                c.req.valid("param").id,
                c.req.valid("json"),
            )
            return respond(c, BackofficeCategoriesRoutes.update, HttpStatus.Ok, category)
        } catch (error) {
            throw toApplicationError(error, "Error updating the category")
        }
    })

    router.openapi(BackofficeCategoriesRoutes.delete, async c => {
        try {
            await categories.delete(c.req.valid("param").id)
            return c.body(null, HttpStatus.NoContent)
        } catch (error) {
            throw toApplicationError(error, "Error deleting the category")
        }
    })

    router.openapi(BackofficeCategoriesRoutes.createImageUploadTicket, async c => {
        try {
            const ticket = await categories.createImageUploadTicket(
                c.req.valid("param").id,
                c.req.valid("json"),
            )
            return respond(
                c,
                BackofficeCategoriesRoutes.createImageUploadTicket,
                HttpStatus.Ok,
                ticket,
            )
        } catch (error) {
            throw toApplicationError(
                error,
                "Error creating the category image upload ticket",
            )
        }
    })

    return router
}
