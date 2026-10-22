import { createRoute, z } from "@hono/zod-openapi"
import {
    paginatedResponseSchema,
    photoUploadRequestSchema,
    presignedUploadSchema,
    venueBlockSchema,
    venueCreationSchema,
    venueListQuerySchema,
    venueOwnerSchema,
    venueSchema,
    venueUpdateSchema,
} from "models"

import {
    badRequestResponse,
    conflictResponse,
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
            409: conflictResponse("The Organizer already owns a venue"),
        },
        tags: ["Backoffice"],
        summary: "Create venue",
        description:
            "An Organizer creates one venue and owns it; an Admin creates venues with no owner.",
    }),

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
        description:
            "An Admin edits any venue, an Organizer the venue it owns. `coverPhotoKey` takes the key of a cover upload ticket.",
    }),

    setOwner: createRoute({
        method: "put",
        path: "/api/backoffice/venues/{id}/owner",
        request: {
            params: venueParamsSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: venueOwnerSchema.openapi("VenueOwner"),
                    },
                },
            },
        },
        responses: {
            200: {
                content: { "application/json": { schema: venueResponseSchema } },
                description: "Owner set",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
            404: notFoundResponse("Venue"),
            409: conflictResponse("The Organizer already owns another venue"),
        },
        tags: ["Backoffice"],
        summary: "Set venue owner",
    }),

    block: createRoute({
        method: "post",
        path: "/api/backoffice/venues/{id}/block",
        request: {
            params: venueParamsSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: venueBlockSchema.openapi("VenueBlock"),
                    },
                },
            },
        },
        responses: {
            200: {
                content: { "application/json": { schema: venueResponseSchema } },
                description: "Venue blocked",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
            404: notFoundResponse("Venue"),
        },
        tags: ["Backoffice"],
        summary: "Block venue",
    }),

    unblock: createRoute({
        method: "post",
        path: "/api/backoffice/venues/{id}/unblock",
        request: { params: venueParamsSchema },
        responses: {
            200: {
                content: { "application/json": { schema: venueResponseSchema } },
                description: "Venue unblocked",
            },
            ...sessionErrorResponses,
            404: notFoundResponse("Venue"),
        },
        tags: ["Backoffice"],
        summary: "Unblock venue",
    }),

    createCoverUploadTicket: createRoute({
        method: "post",
        path: "/api/backoffice/venues/{id}/cover/upload-ticket",
        request: {
            params: venueParamsSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: photoUploadRequestSchema.openapi("PhotoUploadRequest"),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: presignedUploadSchema.openapi("PresignedUpload"),
                    },
                },
                description: "Presigned PUT of one cover",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
            404: notFoundResponse("Venue"),
        },
        tags: ["Backoffice"],
        summary: "Create venue cover upload ticket",
        description:
            "Returns a presigned PUT under a key of the venue. The venue update then sends the key as `coverPhotoKey`.",
    }),
}
