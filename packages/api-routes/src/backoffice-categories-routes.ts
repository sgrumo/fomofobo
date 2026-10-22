import { createRoute, z } from "@hono/zod-openapi"
import {
    categoryCreationSchema,
    categorySchema,
    categoryUpdateSchema,
    photoUploadRequestSchema,
    presignedUploadSchema,
} from "models"

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
            409: conflictResponse("Another category has the name"),
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
            409: conflictResponse("Another category has the name"),
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

    createImageUploadTicket: createRoute({
        method: "post",
        path: "/api/backoffice/categories/{id}/image/upload-ticket",
        request: {
            params: categoryParamsSchema,
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
                description: "Presigned PUT of one category image",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
            404: notFoundResponse("Category"),
        },
        tags: ["Backoffice"],
        summary: "Create category image upload ticket",
        description:
            "Returns a presigned PUT under a key of the category. The category update then sends the key as `imageKey`.",
    }),
}
