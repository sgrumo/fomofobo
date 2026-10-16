import { createRoute, z } from "@hono/zod-openapi"
import { categoryCreationSchema, categorySchema, categoryUpdateSchema } from "models"

import {
    badRequestResponse,
    conflictResponse,
    notFoundResponse,
    sessionErrorResponses,
} from "./lib/common-responses"

const categoryResponseSchema = categorySchema.openapi("Category")
const categoryParamsSchema = z.object({ id: z.uuid().openapi("Category ID") })

export const BackofficeCategoriesRoutes = {
    create: createRoute({
        method: "post",
        path: "/api/backoffice/categories",
        request: {
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: categoryCreationSchema.openapi("CategoryCreation"),
                    },
                },
            },
        },
        responses: {
            201: {
                content: { "application/json": { schema: categoryResponseSchema } },
                description: "Category created",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
        },
        tags: ["Backoffice"],
        summary: "Create category",
    }),

    update: createRoute({
        method: "patch",
        path: "/api/backoffice/categories/{id}",
        request: {
            params: categoryParamsSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: categoryUpdateSchema.openapi("CategoryUpdate"),
                    },
                },
            },
        },
        responses: {
            200: {
                content: { "application/json": { schema: categoryResponseSchema } },
                description: "Category updated",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
            404: notFoundResponse("Category"),
        },
        tags: ["Backoffice"],
        summary: "Update category",
    }),

    // PLACEHOLDER(OP-24): the answer when an event uses the category
    delete: createRoute({
        method: "delete",
        path: "/api/backoffice/categories/{id}",
        request: { params: categoryParamsSchema },
        responses: {
            204: { description: "Category deleted" },
            ...sessionErrorResponses,
            404: notFoundResponse("Category"),
            409: conflictResponse("An event uses the category"),
        },
        tags: ["Backoffice"],
        summary: "Delete category",
    }),
}
