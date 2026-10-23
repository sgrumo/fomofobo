import "server-only"
import { swaggerUI } from "@hono/swagger-ui"
import { OpenAPIHono } from "@hono/zod-openapi"
import type { ApplicationError } from "backend-shared/http"
import { handleErrors, loggerMiddleware } from "backend-shared/http"
import { memoize } from "es-toolkit"
import { accountRoleSchema, HttpStatus, organizerCreationSchema } from "models"
import { deleteAllRows } from "storage"
import { match } from "ts-pattern"

import { SIGN_IN_PATH } from "@/lib/auth/sign-in"

import { backofficeSession } from "./auth/backoffice-session"
import { CATEGORIES_TAG, expireTags, PLACES_TAG, PUBLIC_TAG, SETTINGS_TAG } from "./cache"
import { requestClock } from "./clock"
import { getContainer } from "./container"
import type { AppErrorCode } from "./errors"
import { handleRouteNotFound } from "./errors"
import { buildBackofficeCategoriesRouter } from "./routers/backoffice-categories-router"
import { buildBackofficeEventsRouter } from "./routers/backoffice-events-router"
import { buildBackofficeOrganizersRouter } from "./routers/backoffice-organizers-router"
import { buildBackofficeSessionRouter } from "./routers/backoffice-session-router"
import { buildBackofficeSettingsRouter } from "./routers/backoffice-settings-router"
import { buildBackofficeVenuesRouter } from "./routers/backoffice-venues-router"
import { buildClientCompatibilityRouter } from "./routers/client-compatibility-router"
import { buildPublicRouter } from "./routers/public-router"

/**
 * Prefix the Next catch-all route answers on. Every route definition of
 * `api-routes` already carries it, so the Hono application declares no base path
 * and only the infrastructure routes below repeat it.
 */
export const apiBasePath = "/api"

const testAccountSeedSchema = organizerCreationSchema.extend({ role: accountRoleSchema })

/**
 * @description Maps an application error code to its HTTP status
 * @param err Application error read
 */
export const mapErrorStatus = (err: ApplicationError<AppErrorCode>): HttpStatus =>
    match(err.code)
        .with("GenericError", "ResponseValidationError", () => HttpStatus.InternalError)
        .with(
            "InvalidRequest",
            "InvalidPhotoUpload",
            "InvalidEventReference",
            "TooManyOccurrences",
            "PastDateRange",
            "InvalidVenueOwner",
            "InvalidVenueCategory",
            () => HttpStatus.BadRequest,
        )
        .with(
            "RouteNotFound",
            "ItemNotFound",
            "OccurrenceNotFound",
            "EventNotFound",
            "VenueNotFound",
            "CategoryNotFound",
            "OrganizerNotFound",
            () => HttpStatus.NotFound,
        )
        .with("Unauthenticated", "AccountBlocked", () => HttpStatus.Unauthorized)
        .with("ForbiddenAction", () => HttpStatus.Forbidden)
        .with(
            "EmailTaken",
            "CategoryInUse",
            "CategoryNameTaken",
            "VenueLimitReached",
            "VenueOwnerTaken",
            "PermanentVenueOwner",
            () => HttpStatus.Conflict,
        )
        .with("TooManyRequests", () => HttpStatus.TooManyRequests)
        .with("GeocodingUnavailable", () => HttpStatus.ServiceUnavailable)
        .exhaustive()

/**
 * @description Builds the API with its dependencies, routers and OpenAPI document
 * @throws When the environment misses a variable of its `APP_ENV` variant
 * @remarks Serves the OpenAPI document and its Swagger UI outside production only, so a
 * deployed build exposes neither
 * @remarks Exposes one endpoint of the auth library, the sign-in. Its other endpoints,
 * the sign-up and the account changes included, answer `404`: the services call the
 * library on the server
 * @remarks Checks the session of every `/api/backoffice/*` call, a route not mounted
 * included, so an unknown backoffice path answers `401` to a visitor without one
 */
const buildApi = (): OpenAPIHono => {
    const {
        appConfig,
        auth,
        authAccounts,
        categories,
        clientCompatibility,
        db,
        events,
        occurrences,
        organizers,
        photos,
        places,
        publicVenues,
        saves,
        settings,
        venues,
    } = getContainer()

    const app = new OpenAPIHono()

    app.use(loggerMiddleware)
    app.notFound(handleRouteNotFound)
    app.onError(
        handleErrors(mapErrorStatus, {
            verboseErrors: appConfig.verboseErrors,
        }),
    )

    app.use(`${apiBasePath}/*`, requestClock(appConfig.testRoutesEnabled))

    app.get(`${apiBasePath}/health`, c => c.json({ status: "ok" }))

    app.post(SIGN_IN_PATH, c => auth.handler(c.req.raw))

    app.route(
        "/",
        buildPublicRouter({
            categories,
            occurrences,
            places,
            saves,
            venues: publicVenues,
        }),
    )

    app.route("/", buildClientCompatibilityRouter(clientCompatibility))

    app.use(`${apiBasePath}/backoffice/*`, backofficeSession(authAccounts))
    app.route("/", buildBackofficeSessionRouter())
    app.route("/", buildBackofficeCategoriesRouter(categories))
    app.route("/", buildBackofficeVenuesRouter(venues))
    app.route("/", buildBackofficeOrganizersRouter(organizers))
    app.route("/", buildBackofficeEventsRouter(events, photos))
    app.route("/", buildBackofficeSettingsRouter(settings))

    if (appConfig.testRoutesEnabled) {
        app.post(`${apiBasePath}/test/reset-database`, async c => {
            await deleteAllRows(db)
            expireTags(PUBLIC_TAG, CATEGORIES_TAG, PLACES_TAG, SETTINGS_TAG)
            return c.body(null, HttpStatus.NoContent)
        })
        app.post(`${apiBasePath}/test/accounts`, async c => {
            const seed = testAccountSeedSchema.parse(await c.req.json())
            const account = await authAccounts.createAccount(seed, seed.role)
            return c.json(account, HttpStatus.Created)
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
