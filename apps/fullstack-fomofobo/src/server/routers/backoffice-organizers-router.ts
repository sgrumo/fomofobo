import "server-only"
import { BackofficeOrganizersRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import type { BackofficeEnv } from "../auth/backoffice-session"
import { requireRole } from "../auth/backoffice-session"
import { toApplicationError } from "../errors"
import type { OrganizersService } from "../services/organizers-service"

/**
 * @description Builds the router of the organizer accounts, Admin only
 * @param organizers Organizer reads, creation, block and password
 */
export const buildBackofficeOrganizersRouter = (organizers: OrganizersService) => {
    const router = createRouter<BackofficeEnv>()

    const listPath = BackofficeOrganizersRoutes.list.getRoutingPath()
    router.use(listPath, requireRole("admin"))
    router.use(`${listPath}/*`, requireRole("admin"))

    router.openapi(BackofficeOrganizersRoutes.list, async c => {
        try {
            const page = await organizers.list(c.req.valid("query"))
            return respond(c, BackofficeOrganizersRoutes.list, HttpStatus.Ok, page)
        } catch (error) {
            throw toApplicationError(error, "Error listing the organizers")
        }
    })

    router.openapi(BackofficeOrganizersRoutes.getById, async c => {
        try {
            const account = await organizers.getById(c.req.valid("param").id)
            return respond(c, BackofficeOrganizersRoutes.getById, HttpStatus.Ok, account)
        } catch (error) {
            throw toApplicationError(error, "Error reading the organizer")
        }
    })

    router.openapi(BackofficeOrganizersRoutes.create, async c => {
        try {
            const account = await organizers.create(c.req.valid("json"))
            return respond(
                c,
                BackofficeOrganizersRoutes.create,
                HttpStatus.Created,
                account,
            )
        } catch (error) {
            throw toApplicationError(error, "Error creating the organizer")
        }
    })

    router.openapi(BackofficeOrganizersRoutes.block, async c => {
        try {
            const account = await organizers.setBlocked(c.req.valid("param").id, true)
            return respond(c, BackofficeOrganizersRoutes.block, HttpStatus.Ok, account)
        } catch (error) {
            throw toApplicationError(error, "Error blocking the organizer")
        }
    })

    router.openapi(BackofficeOrganizersRoutes.unblock, async c => {
        try {
            const account = await organizers.setBlocked(c.req.valid("param").id, false)
            return respond(c, BackofficeOrganizersRoutes.unblock, HttpStatus.Ok, account)
        } catch (error) {
            throw toApplicationError(error, "Error unblocking the organizer")
        }
    })

    router.openapi(BackofficeOrganizersRoutes.setPassword, async c => {
        try {
            await organizers.setPassword(
                c.req.valid("param").id,
                c.req.valid("json").password,
            )
            return c.body(null, HttpStatus.NoContent)
        } catch (error) {
            throw toApplicationError(error, "Error setting the organizer password")
        }
    })

    return router
}
