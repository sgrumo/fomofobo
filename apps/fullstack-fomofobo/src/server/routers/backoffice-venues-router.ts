import "server-only"
import { BackofficeVenuesRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import type { BackofficeEnv } from "../auth/backoffice-session"
import { requireRole } from "../auth/backoffice-session"
import { toApplicationError } from "../errors"
import type { VenuesService } from "../services/venues-service"

/**
 * @description Builds the router of the venues: both roles read, create and edit, Admins set owners and block
 * @param venues Venue rules, reads and writes
 */
export const buildBackofficeVenuesRouter = (venues: VenuesService) => {
    const router = createRouter<BackofficeEnv>()

    router.use(BackofficeVenuesRoutes.setOwner.getRoutingPath(), requireRole("admin"))
    router.use(BackofficeVenuesRoutes.setKind.getRoutingPath(), requireRole("admin"))
    router.use(BackofficeVenuesRoutes.block.getRoutingPath(), requireRole("admin"))
    router.use(BackofficeVenuesRoutes.unblock.getRoutingPath(), requireRole("admin"))

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
            const venue = await venues.create(c.req.valid("json"), c.var.account)
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
                c.var.account,
            )
            return respond(c, BackofficeVenuesRoutes.update, HttpStatus.Ok, venue)
        } catch (error) {
            throw toApplicationError(error, "Error updating the venue")
        }
    })

    router.openapi(BackofficeVenuesRoutes.setOwner, async c => {
        try {
            const venue = await venues.setOwner(
                c.req.valid("param").id,
                c.req.valid("json").ownerId,
            )
            return respond(c, BackofficeVenuesRoutes.setOwner, HttpStatus.Ok, venue)
        } catch (error) {
            throw toApplicationError(error, "Error setting the venue owner")
        }
    })

    router.openapi(BackofficeVenuesRoutes.setKind, async c => {
        try {
            const venue = await venues.setKind(
                c.req.valid("param").id,
                c.req.valid("json"),
            )
            return respond(c, BackofficeVenuesRoutes.setKind, HttpStatus.Ok, venue)
        } catch (error) {
            throw toApplicationError(error, "Error setting the venue kind")
        }
    })

    router.openapi(BackofficeVenuesRoutes.block, async c => {
        try {
            const venue = await venues.setBlocked(c.req.valid("param").id, {
                isBlocked: true,
                blockReason: c.req.valid("json").reason,
            })
            return respond(c, BackofficeVenuesRoutes.block, HttpStatus.Ok, venue)
        } catch (error) {
            throw toApplicationError(error, "Error blocking the venue")
        }
    })

    router.openapi(BackofficeVenuesRoutes.unblock, async c => {
        try {
            const venue = await venues.setBlocked(c.req.valid("param").id, {
                isBlocked: false,
                blockReason: null,
            })
            return respond(c, BackofficeVenuesRoutes.unblock, HttpStatus.Ok, venue)
        } catch (error) {
            throw toApplicationError(error, "Error unblocking the venue")
        }
    })

    router.openapi(BackofficeVenuesRoutes.createCoverUploadTicket, async c => {
        try {
            const ticket = await venues.createCoverUploadTicket(
                c.req.valid("param").id,
                c.req.valid("json"),
                c.var.account,
            )
            return respond(
                c,
                BackofficeVenuesRoutes.createCoverUploadTicket,
                HttpStatus.Ok,
                ticket,
            )
        } catch (error) {
            throw toApplicationError(error, "Error creating the cover upload ticket")
        }
    })

    return router
}
