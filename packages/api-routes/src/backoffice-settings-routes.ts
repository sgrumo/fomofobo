import { createRoute } from "@hono/zod-openapi"
import { platformSettingsSchema, platformSettingsUpdateSchema } from "models"

import { badRequestResponse, sessionErrorResponses } from "./lib/common-responses"

const platformSettingsResponseSchema = platformSettingsSchema.openapi("PlatformSettings")

export const BackofficeSettingsRoutes = {
    get: createRoute({
        method: "get",
        path: "/api/backoffice/settings",
        responses: {
            200: {
                content: {
                    "application/json": { schema: platformSettingsResponseSchema },
                },
                description: "Platform settings, the defaults until an Admin saves them",
            },
            ...sessionErrorResponses,
        },
        tags: ["Backoffice"],
        summary: "Get platform settings",
    }),

    update: createRoute({
        method: "put",
        path: "/api/backoffice/settings",
        request: {
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: platformSettingsUpdateSchema.openapi(
                            "PlatformSettingsUpdate",
                        ),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    "application/json": { schema: platformSettingsResponseSchema },
                },
                description: "Platform settings saved",
            },
            400: badRequestResponse,
            ...sessionErrorResponses,
        },
        tags: ["Backoffice"],
        summary: "Update platform settings",
    }),
}
