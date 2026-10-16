import { createRoute, z } from "@hono/zod-openapi"
import {
    accountSchema,
    organizerCreationSchema,
    organizerListQuerySchema,
    organizerPasswordSchema,
    paginatedResponseSchema,
} from "models"

import {
    badRequestResponse,
    conflictResponse,
    notFoundResponse,
    sessionErrorResponses,
} from "./lib/common-responses"

const accountResponseSchema = accountSchema.openapi("Account")
const organizerParamsSchema = z.object({ id: z.uuid().openapi("Organizer ID") })

export const BackofficeOrganizersRoutes = {
    list: createRoute({
        method: "get",
        path: "/api/backoffice/organizers",
        request: { query: organizerListQuerySchema.openapi("OrganizerListQuery") },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: paginatedResponseSchema(accountResponseSchema).openapi(
                            "OrganizerPage",
                        ),
                    },
                },
                description: "One page of the organizers, by name",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
        },
        tags: ["Backoffice"],
        summary: "List organizers",
    }),

    getById: createRoute({
        method: "get",
        path: "/api/backoffice/organizers/{id}",
        request: { params: organizerParamsSchema },
        responses: {
            200: {
                content: { "application/json": { schema: accountResponseSchema } },
                description: "Organizer retrieved",
            },
            ...sessionErrorResponses,
            404: notFoundResponse("Organizer"),
        },
        tags: ["Backoffice"],
        summary: "Get organizer",
    }),

    create: createRoute({
        method: "post",
        path: "/api/backoffice/organizers",
        request: {
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: organizerCreationSchema.openapi("OrganizerCreation"),
                    },
                },
            },
        },
        responses: {
            201: {
                content: { "application/json": { schema: accountResponseSchema } },
                description: "Organizer created",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
            409: conflictResponse("Email taken by another account"),
        },
        tags: ["Backoffice"],
        summary: "Create organizer",
    }),

    block: createRoute({
        method: "post",
        path: "/api/backoffice/organizers/{id}/block",
        request: { params: organizerParamsSchema },
        responses: {
            200: {
                content: { "application/json": { schema: accountResponseSchema } },
                description: "Organizer blocked, every session ended",
            },
            ...sessionErrorResponses,
            404: notFoundResponse("Organizer"),
        },
        tags: ["Backoffice"],
        summary: "Block organizer",
    }),

    unblock: createRoute({
        method: "post",
        path: "/api/backoffice/organizers/{id}/unblock",
        request: { params: organizerParamsSchema },
        responses: {
            200: {
                content: { "application/json": { schema: accountResponseSchema } },
                description: "Organizer unblocked",
            },
            ...sessionErrorResponses,
            404: notFoundResponse("Organizer"),
        },
        tags: ["Backoffice"],
        summary: "Unblock organizer",
    }),

    // PLACEHOLDER(OP-25)
    setPassword: createRoute({
        method: "post",
        path: "/api/backoffice/organizers/{id}/password",
        request: {
            params: organizerParamsSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: organizerPasswordSchema.openapi("OrganizerPassword"),
                    },
                },
            },
        },
        responses: {
            204: { description: "Password set, every session ended" },
            400: badRequestResponse,
            ...sessionErrorResponses,
            404: notFoundResponse("Organizer"),
        },
        tags: ["Backoffice"],
        summary: "Set organizer password",
    }),
}
