import { createRoute } from "@hono/zod-openapi"
import { clientCompatibilityHeadersSchema, clientCompatibilitySchema } from "models"

import { badRequestResponse } from "./lib/common-responses"

export const ClientCompatibilityRoutes = {
    check: createRoute({
        method: "get",
        path: "/api/client-compatibility",
        request: {
            headers: clientCompatibilityHeadersSchema.openapi(
                "ClientCompatibilityHeaders",
            ),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: clientCompatibilitySchema.openapi("ClientCompatibility"),
                    },
                },
                description: "Compatibility decision for the calling app build",
            },
            400: badRequestResponse,
        },
        tags: ["Client"],
        summary: "Check client compatibility",
        description:
            "Returns the action the app must take for its version: none, an optional update, a required update, or maintenance.",
    }),
}
