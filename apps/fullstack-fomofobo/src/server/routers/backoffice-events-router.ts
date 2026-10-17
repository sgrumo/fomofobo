import "server-only"
import { BackofficeEventsRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import type { BackofficeEnv } from "../auth/backoffice-session"
import { requireRole } from "../auth/backoffice-session"
import { toApplicationError } from "../errors"
import type { EventsService } from "../services/events-service"
import type { PhotosService } from "../services/photos-service"

/**
 * @description Builds the router of the backoffice events and their photo uploads
 * @param events Event rules, reads and writes
 * @param photos Photo upload tickets
 */
export const buildBackofficeEventsRouter = (
    events: EventsService,
    photos: PhotosService,
) => {
    const router = createRouter<BackofficeEnv>()

    router.use(BackofficeEventsRoutes.block.getRoutingPath(), requireRole("admin"))
    router.use(BackofficeEventsRoutes.unblock.getRoutingPath(), requireRole("admin"))

    router.openapi(BackofficeEventsRoutes.list, async c => {
        try {
            const page = await events.list(c.req.valid("query"), c.var.account)
            return respond(c, BackofficeEventsRoutes.list, HttpStatus.Ok, page)
        } catch (error) {
            throw toApplicationError(error, "Error listing the events")
        }
    })

    router.openapi(BackofficeEventsRoutes.getById, async c => {
        try {
            const event = await events.getById(c.req.valid("param").id, c.var.account)
            return respond(c, BackofficeEventsRoutes.getById, HttpStatus.Ok, event)
        } catch (error) {
            throw toApplicationError(error, "Error reading the event")
        }
    })

    router.openapi(BackofficeEventsRoutes.create, async c => {
        try {
            const event = await events.create(c.req.valid("json"), c.var.account)
            return respond(c, BackofficeEventsRoutes.create, HttpStatus.Created, event)
        } catch (error) {
            throw toApplicationError(error, "Error creating the event")
        }
    })

    router.openapi(BackofficeEventsRoutes.update, async c => {
        try {
            const event = await events.update(
                c.req.valid("param").id,
                c.req.valid("json"),
                c.var.account,
            )
            return respond(c, BackofficeEventsRoutes.update, HttpStatus.Ok, event)
        } catch (error) {
            throw toApplicationError(error, "Error replacing the event")
        }
    })

    router.openapi(BackofficeEventsRoutes.delete, async c => {
        try {
            await events.delete(c.req.valid("param").id, c.var.account)
            return c.body(null, HttpStatus.NoContent)
        } catch (error) {
            throw toApplicationError(error, "Error deleting the event")
        }
    })

    router.openapi(BackofficeEventsRoutes.block, async c => {
        try {
            const event = await events.setBlocked(
                c.req.valid("param").id,
                { isBlocked: true, blockReason: c.req.valid("json").reason },
                c.var.account,
            )
            return respond(c, BackofficeEventsRoutes.block, HttpStatus.Ok, event)
        } catch (error) {
            throw toApplicationError(error, "Error blocking the event")
        }
    })

    router.openapi(BackofficeEventsRoutes.unblock, async c => {
        try {
            const event = await events.setBlocked(
                c.req.valid("param").id,
                { isBlocked: false, blockReason: null },
                c.var.account,
            )
            return respond(c, BackofficeEventsRoutes.unblock, HttpStatus.Ok, event)
        } catch (error) {
            throw toApplicationError(error, "Error unblocking the event")
        }
    })

    router.openapi(BackofficeEventsRoutes.createPhotoUploadTicket, async c => {
        try {
            const ticket = await photos.createUploadTicket(
                c.req.valid("json"),
                c.var.account.id,
            )
            return respond(
                c,
                BackofficeEventsRoutes.createPhotoUploadTicket,
                HttpStatus.Ok,
                ticket,
            )
        } catch (error) {
            throw toApplicationError(error, "Error creating the photo upload ticket")
        }
    })

    return router
}
