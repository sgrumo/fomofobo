import "server-only"
import { BackofficeActiveDevicesRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import type { BackofficeEnv } from "../auth/backoffice-session"
import { requireRole } from "../auth/backoffice-session"
import { toApplicationError } from "../errors"
import type { ActiveDevicesService } from "../services/active-devices-service"

/**
 * @description Builds the router of the active device counts, Admin only
 * @param activeDevices Active device counts
 */
export const buildBackofficeActiveDevicesRouter = (
    activeDevices: ActiveDevicesService,
) => {
    const router = createRouter<BackofficeEnv>()

    router.use(BackofficeActiveDevicesRoutes.get.getRoutingPath(), requireRole("admin"))

    router.openapi(BackofficeActiveDevicesRoutes.get, async c => {
        try {
            const stats = await activeDevices.stats(c.var.now)
            return respond(c, BackofficeActiveDevicesRoutes.get, HttpStatus.Ok, stats)
        } catch (error) {
            throw toApplicationError(error, "Error fetching the active devices")
        }
    })

    return router
}
