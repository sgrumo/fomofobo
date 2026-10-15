import { createRoute } from "@hono/zod-openapi"
import { accountSchema } from "models"

import { sessionErrorResponses } from "./lib/common-responses"

export const BackofficeSessionRoutes = {
    me: createRoute({
        method: "get",
        path: "/api/backoffice/me",
        responses: {
            200: {
                content: {
                    "application/json": { schema: accountSchema.openapi("Account") },
                },
                description: "Account of the session",
            },
            ...sessionErrorResponses,
        },
        tags: ["Backoffice"],
        summary: "Get session account",
    }),
}
