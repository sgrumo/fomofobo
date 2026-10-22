import "server-only"
import { BackofficeSettingsRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import type { BackofficeEnv } from "../auth/backoffice-session"
import { requireRole } from "../auth/backoffice-session"
import { toApplicationError } from "../errors"
import type { SettingsService } from "../services/settings-service"

/**
 * @description Builds the router of the platform settings, Admin only
 * @param settings Settings reads and writes
 */
export const buildBackofficeSettingsRouter = (settings: SettingsService) => {
    const router = createRouter<BackofficeEnv>()

    router.use(BackofficeSettingsRoutes.get.getRoutingPath(), requireRole("admin"))

    router.openapi(BackofficeSettingsRoutes.get, async c => {
        try {
            const current = await settings.get()
            return respond(c, BackofficeSettingsRoutes.get, HttpStatus.Ok, current)
        } catch (error) {
            throw toApplicationError(error, "Error fetching the settings")
        }
    })

    router.openapi(BackofficeSettingsRoutes.update, async c => {
        try {
            const saved = await settings.update(c.req.valid("json"), c.var.account)
            return respond(c, BackofficeSettingsRoutes.update, HttpStatus.Ok, saved)
        } catch (error) {
            throw toApplicationError(error, "Error saving the settings")
        }
    })

    return router
}
