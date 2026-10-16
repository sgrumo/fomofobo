import { createRoute, z } from "@hono/zod-openapi"
import {
    eventBlockSchema,
    eventListItemSchema,
    eventListQuerySchema,
    eventSchema,
    eventUpsertSchema,
    paginatedResponseSchema,
    photoUploadRequestSchema,
    presignedUploadSchema,
} from "models"

import {
    badRequestResponse,
    notFoundResponse,
    sessionErrorResponses,
} from "./lib/common-responses"

const eventResponseSchema = eventSchema.openapi("Event")
const eventUpsertBodySchema = eventUpsertSchema.openapi("EventUpsert")
const eventParamsSchema = z.object({ id: z.uuid().openapi("Event ID") })

export const BackofficeEventsRoutes = {
    list: createRoute({
        method: "get",
        path: "/api/backoffice/events",
        request: { query: eventListQuerySchema.openapi("EventListQuery") },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: paginatedResponseSchema(
                            eventListItemSchema.openapi("EventListItem"),
                        ).openapi("EventPage"),
                    },
                },
                description: "One page of the events, latest start first",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
        },
        tags: ["Backoffice"],
        summary: "List events",
        description:
            "Returns the events of the Organizer of the session, or every event for an Admin.",
    }),

    getById: createRoute({
        method: "get",
        path: "/api/backoffice/events/{id}",
        request: { params: eventParamsSchema },
        responses: {
            200: {
                content: { "application/json": { schema: eventResponseSchema } },
                description: "Event retrieved",
            },
            ...sessionErrorResponses,
            404: notFoundResponse("Event"),
        },
        tags: ["Backoffice"],
        summary: "Get event",
    }),

    create: createRoute({
        method: "post",
        path: "/api/backoffice/events",
        request: {
            body: {
                required: true,
                content: { "application/json": { schema: eventUpsertBodySchema } },
            },
        },
        responses: {
            201: {
                content: { "application/json": { schema: eventResponseSchema } },
                description: "Event created",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
        },
        tags: ["Backoffice"],
        summary: "Create event",
        description: "Answers 403 when an Organizer sends `organizerId`.",
    }),

    update: createRoute({
        method: "put",
        path: "/api/backoffice/events/{id}",
        request: {
            params: eventParamsSchema,
            body: {
                required: true,
                content: { "application/json": { schema: eventUpsertBodySchema } },
            },
        },
        responses: {
            200: {
                content: { "application/json": { schema: eventResponseSchema } },
                description: "Event replaced",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
            404: notFoundResponse("Event"),
        },
        tags: ["Backoffice"],
        summary: "Replace event",
    }),

    delete: createRoute({
        method: "delete",
        path: "/api/backoffice/events/{id}",
        request: { params: eventParamsSchema },
        responses: {
            204: { description: "Event deleted" },
            ...sessionErrorResponses,
            404: notFoundResponse("Event"),
        },
        tags: ["Backoffice"],
        summary: "Delete event",
    }),

    block: createRoute({
        method: "post",
        path: "/api/backoffice/events/{id}/block",
        request: {
            params: eventParamsSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: eventBlockSchema.openapi("EventBlock"),
                    },
                },
            },
        },
        responses: {
            200: {
                content: { "application/json": { schema: eventResponseSchema } },
                description: "Event blocked",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
            404: notFoundResponse("Event"),
        },
        tags: ["Backoffice"],
        summary: "Block event",
    }),

    unblock: createRoute({
        method: "post",
        path: "/api/backoffice/events/{id}/unblock",
        request: { params: eventParamsSchema },
        responses: {
            200: {
                content: { "application/json": { schema: eventResponseSchema } },
                description: "Event unblocked",
            },
            ...sessionErrorResponses,
            404: notFoundResponse("Event"),
        },
        tags: ["Backoffice"],
        summary: "Unblock event",
    }),

    createPhotoUploadTicket: createRoute({
        method: "post",
        path: "/api/backoffice/photos/upload-ticket",
        request: {
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
                description: "Presigned PUT of one photo",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
        },
        tags: ["Backoffice"],
        summary: "Create photo upload ticket",
        description:
            "Returns a presigned PUT that binds the content type and the size. The event write then lists the returned key.",
    }),
}
