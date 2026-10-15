import { handle } from "hono/vercel"

import { getApi } from "@/server/api"

// The API reads the database and the object store, so it never prerenders.
export const dynamic = "force-dynamic"
// The Postgres driver and the AWS SDK both need Node, not the Edge runtime.
export const runtime = "nodejs"

/**
 * @description Dispatches the request into the Hono application
 * @param request Incoming request
 * @remarks Builds the application on the first request, never at module evaluation
 */
const handler = (request: Request): Response | Promise<Response> =>
    handle(getApi())(request)

export {
    handler as DELETE,
    handler as GET,
    handler as PATCH,
    handler as POST,
    handler as PUT,
}
