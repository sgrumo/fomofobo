import "server-only"
import { ClientCompatibilityRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import { toApplicationError } from "../errors"
import type { ClientCompatibilityService } from "../services/client-compatibility-service"

/**
 * @description Builds the router of the version gate of the mobile app, open to every caller
 * @param service Action resolution for a platform and a version
 */
export const buildClientCompatibilityRouter = (service: ClientCompatibilityService) => {
    const router = createRouter()

    router.openapi(ClientCompatibilityRoutes.check, c => {
        try {
            const headers = c.req.valid("header")
            const compatibility = service.check(
                headers["x-app-platform"],
                headers["x-app-version"],
            )
            return respond(
                c,
                ClientCompatibilityRoutes.check,
                HttpStatus.Ok,
                compatibility,
            )
        } catch (error) {
            throw toApplicationError(error, "Error checking the client compatibility")
        }
    })

    return router
}
