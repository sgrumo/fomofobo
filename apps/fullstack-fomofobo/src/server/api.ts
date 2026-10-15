import "server-only"
import { swaggerUI } from "@hono/swagger-ui"
import { OpenAPIHono } from "@hono/zod-openapi"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { createAuthMiddleware } from "backend-shared/auth"
import type { ApplicationError } from "backend-shared/http"
import { handleErrors, loggerMiddleware } from "backend-shared/http"
import { memoize } from "es-toolkit"
import { HttpStatus } from "models"
import { buildDbInstance, deleteAllRows } from "storage"
import { match } from "ts-pattern"

import { getSessionCookieConfig } from "./auth/cookie-names"
import { getContainer } from "./container"
import type { AppErrorCode } from "./errors"
import { handleRouteNotFound } from "./errors"

/**
 * Prefix the Next catch-all route answers on. Every route definition of
 * `api-routes` already carries it, so the Hono application declares no base path
 * and only the infrastructure routes below repeat it.
 */
export const apiBasePath = "/api"

/**
 * @description Maps an application error code to its HTTP status
 * @param err Application error read
 */
export const mapErrorStatus = (err: ApplicationError<AppErrorCode>): HttpStatus =>
    match(err.code)
        .with("GenericError", "ResponseValidationError", () => HttpStatus.InternalError)
        .with("InvalidRequest", () => HttpStatus.BadRequest)
        .with("RouteNotFound", "ItemNotFound", () => HttpStatus.NotFound)
        .with("Unauthenticated", () => HttpStatus.Unauthorized)
        // The provider, not the caller: a retry is the answer, never a new login.
        .with("AuthProviderUnavailable", () => HttpStatus.ServiceUnavailable)
        .with("ForbiddenAction", () => HttpStatus.Forbidden)
        .exhaustive()

/**
 * @description Builds the API with its dependencies, routers and OpenAPI document
 * @throws When the environment misses a variable of its `APP_ENV` variant
 * @remarks Serves the OpenAPI document and its Swagger UI outside production only, so a
 * deployed build exposes neither
 * @remarks Guards every route but the infrastructure ones. The documentation stays open
 * where it answers at all, because it describes the API and carries no data of anybody
 */
const buildApi = (): OpenAPIHono => {
    const { appConfig, tokenVerifier } = getContainer()

    const app = new OpenAPIHono()

    app.use(loggerMiddleware)
    // Guards the application, not one router: the in-process dispatch of a Server
    // Component and the `fetch` of the browser both arrive here. The browser holds
    // no token, so the cookie is what carries it on that path.
    app.use(
        createAuthMiddleware({
            verifier: tokenVerifier,
            unauthenticatedCode: "Unauthenticated",
            unavailableCode: "AuthProviderUnavailable",
            cookieName: getSessionCookieConfig().names.access,
            publicPaths: [
                `${apiBasePath}/health`,
                `${apiBasePath}/doc`,
                `${apiBasePath}/swagger`,
                `${apiBasePath}/test/reset-database`,
            ],
        }),
    )
    app.notFound(handleRouteNotFound)
    app.onError(
        handleErrors(mapErrorStatus, {
            verboseErrors: appConfig.verboseErrors,
        }),
    )

    app.get(`${apiBasePath}/health`, c => c.json({ status: "ok" }))

    if (appConfig.databaseResetEnabled) {
        app.post(`${apiBasePath}/test/reset-database`, async c => {
            await deleteAllRows(buildDbInstance(getCloudflareContext().env.DB))
            return c.body(null, HttpStatus.NoContent)
        })
    }

    if (appConfig.apiDocsEnabled) {
        app.doc(`${apiBasePath}/doc`, {
            openapi: "3.0.0",
            info: {
                title: "Fomofobo API",
                version: "1.0.0",
            },
        })
        app.get(`${apiBasePath}/swagger`, swaggerUI({ url: `${apiBasePath}/doc` }))
    }

    return app
}

/**
 * @description Returns the API, building it on the first call
 * @remarks Defers the environment read past module evaluation, so `next build` never
 * boots the dependencies
 * @remarks Caches a successful build only. A boot failure surfaces again on the next
 * request, instead of turning into a `TypeError` on a cached `undefined`
 */
export const getApi = memoize(buildApi)
