import { createRoute, z } from "@hono/zod-openapi"
import {
    paginatedResponseSchema,
    venueCreationSchema,
    venueListQuerySchema,
    venueSchema,
    venueUpdateSchema,
} from "models"

import {
    badRequestResponse,
    notFoundResponse,
    sessionErrorResponses,
} from "./lib/common-responses"

const venueResponseSchema = venueSchema.openapi("Venue")
const venueParamsSchema = z.object({ id: z.uuid().openapi("Venue ID") })

export const BackofficeVenuesRoutes = {
    list: createRoute({
        method: "get",
        path: "/api/backoffice/venues",
        request: { query: venueListQuerySchema.openapi("VenueListQuery") },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: paginatedResponseSchema(venueResponseSchema).openapi(
                            "VenuePage",
                        ),
                    },
                },
                description: "One page of the venues, by name",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
        },
        tags: ["Backoffice"],
        summary: "List venues",
    }),

    getById: createRoute({
        method: "get",
        path: "/api/backoffice/venues/{id}",
        request: { params: venueParamsSchema },
        responses: {
            200: {
                content: { "application/json": { schema: venueResponseSchema } },
                description: "Venue retrieved",
            },
            ...sessionErrorResponses,
            404: notFoundResponse("Venue"),
        },
        tags: ["Backoffice"],
        summary: "Get venue",
    }),

    create: createRoute({
        method: "post",
        path: "/api/backoffice/venues",
        request: {
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: venueCreationSchema.openapi("VenueCreation"),
                    },
                },
            },
        },
        responses: {
            201: {
                content: { "application/json": { schema: venueResponseSchema } },
                description: "Venue created",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
        },
        tags: ["Backoffice"],
        summary: "Create venue",
    }),

    // PLACEHOLDER(OP-20): the roles that may edit a venue
    update: createRoute({
        method: "patch",
        path: "/api/backoffice/venues/{id}",
        request: {
            params: venueParamsSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: venueUpdateSchema.openapi("VenueUpdate"),
                    },
                },
            },
        },
        responses: {
            200: {
                content: { "application/json": { schema: venueResponseSchema } },
                description: "Venue updated",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
            404: notFoundResponse("Venue"),
        },
        tags: ["Backoffice"],
        summary: "Update venue",
    }),
}
