import "server-only"
import { BackofficeVenuesRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import type { BackofficeEnv } from "../auth/backoffice-session"
import { requireRole } from "../auth/backoffice-session"
import { toApplicationError } from "../errors"
import type { VenuesService } from "../services/venues-service"

/**
 * @description Builds the router of the venues: both roles read and create, Admins edit
 * @param venues Venue rules, reads and writes
 */
export const buildBackofficeVenuesRouter = (venues: VenuesService) => {
    const router = createRouter<BackofficeEnv>()

    // PLACEHOLDER(OP-20): Admins alone edit a venue
    router.on(
        "PATCH",
        BackofficeVenuesRoutes.update.getRoutingPath(),
        requireRole("admin"),
    )

    router.openapi(BackofficeVenuesRoutes.list, async c => {
        try {
            const page = await venues.list(c.req.valid("query"))
            return respond(c, BackofficeVenuesRoutes.list, HttpStatus.Ok, page)
        } catch (error) {
            throw toApplicationError(error, "Error listing the venues")
        }
    })

    router.openapi(BackofficeVenuesRoutes.getById, async c => {
        try {
            const venue = await venues.getById(c.req.valid("param").id)
            return respond(c, BackofficeVenuesRoutes.getById, HttpStatus.Ok, venue)
        } catch (error) {
            throw toApplicationError(error, "Error reading the venue")
        }
    })

    router.openapi(BackofficeVenuesRoutes.create, async c => {
        try {
            const venue = await venues.create(c.req.valid("json"), c.var.account.id)
            return respond(c, BackofficeVenuesRoutes.create, HttpStatus.Created, venue)
        } catch (error) {
            throw toApplicationError(error, "Error creating the venue")
        }
    })

    router.openapi(BackofficeVenuesRoutes.update, async c => {
        try {
            const venue = await venues.update(
                c.req.valid("param").id,
                c.req.valid("json"),
            )
            return respond(c, BackofficeVenuesRoutes.update, HttpStatus.Ok, venue)
        } catch (error) {
            throw toApplicationError(error, "Error updating the venue")
        }
    })

    return router
}
