import "server-only"
import { PublicRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import type { ClockEnv } from "../clock"
import { toApplicationError } from "../errors"
import type { CategoriesService } from "../services/categories-service"
import type { PlacesService } from "../services/places-service"
import type { PublicOccurrencesService } from "../services/public-occurrences-service"

/**
 * @description Builds the router of the public app reads, open to every visitor
 * @param services Category reads, occurrence reads and place suggestions
 */
export const buildPublicRouter = (services: {
    categories: CategoriesService
    occurrences: PublicOccurrencesService
    places: PlacesService
}) => {
    const router = createRouter<ClockEnv>()

    router.openapi(PublicRoutes.listCategories, async c => {
        try {
            const categoryList = await services.categories.list()
            return respond(c, PublicRoutes.listCategories, HttpStatus.Ok, categoryList)
        } catch (error) {
            throw toApplicationError(error, "Error listing the categories")
        }
    })

    router.openapi(PublicRoutes.searchOccurrences, async c => {
        try {
            const result = await services.occurrences.search(
                c.req.valid("query"),
                c.var.now,
            )
            return respond(c, PublicRoutes.searchOccurrences, HttpStatus.Ok, result)
        } catch (error) {
            throw toApplicationError(error, "Error searching the occurrences")
        }
    })

    router.openapi(PublicRoutes.lookupOccurrences, async c => {
        try {
            const occurrences = await services.occurrences.lookup(c.req.valid("query"))
            return respond(c, PublicRoutes.lookupOccurrences, HttpStatus.Ok, occurrences)
        } catch (error) {
            throw toApplicationError(error, "Error looking up the occurrences")
        }
    })

    router.openapi(PublicRoutes.getOccurrence, async c => {
        try {
            const occurrence = await services.occurrences.find(c.req.valid("param"))
            return respond(c, PublicRoutes.getOccurrence, HttpStatus.Ok, occurrence)
        } catch (error) {
            throw toApplicationError(error, "Error reading the occurrence")
        }
    })

    router.openapi(PublicRoutes.searchPlaces, async c => {
        try {
            const suggestions = await services.places.suggest(
                c.req.valid("query"),
                c.req.header("x-forwarded-for"),
                c.var.now,
            )
            return respond(c, PublicRoutes.searchPlaces, HttpStatus.Ok, suggestions)
        } catch (error) {
            throw toApplicationError(error, "Error suggesting places")
        }
    })

    return router
}
