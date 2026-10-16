import "server-only"
import { BackofficeSessionRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import type { BackofficeEnv } from "../auth/backoffice-session"
import { toApplicationError } from "../errors"

/**
 * @description Builds the router of the session account
 */
export const buildBackofficeSessionRouter = () => {
    const router = createRouter<BackofficeEnv>()

    router.openapi(BackofficeSessionRoutes.me, c => {
        try {
            return respond(c, BackofficeSessionRoutes.me, HttpStatus.Ok, c.var.account)
        } catch (error) {
            throw toApplicationError(error, "Error reading the session account")
        }
    })

    return router
}
