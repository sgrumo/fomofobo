import { createRoute } from "@hono/zod-openapi"
import { activeDeviceStatsSchema } from "models"

import { sessionErrorResponses } from "./lib/common-responses"

export const BackofficeActiveDevicesRoutes = {
    get: createRoute({
        method: "get",
        path: "/api/backoffice/active-devices",
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: activeDeviceStatsSchema.openapi("ActiveDeviceStats"),
                    },
                },
                description:
                    "Distinct active devices of each platform today, in the last 7 and 30 days, and of each day",
            },
            ...sessionErrorResponses,
        },
        tags: ["Backoffice"],
        summary: "Get active devices",
    }),
}
