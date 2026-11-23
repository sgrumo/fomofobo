import { getContainer } from "@/server/container"

// Names the MCP endpoint of the deployment, so the route never prerenders.
export const dynamic = "force-dynamic"

/**
 * @description Answers the RFC 9728 metadata of the MCP endpoint, which the challenge of
 * an unauthenticated MCP call points at
 * @param request Request of the client, at the resource path after the well-known prefix
 * @remarks Hands the request to the auth library, whose MCP plugin serves this one path
 * and answers `404` to any other
 */
export const GET = async (request: Request): Promise<Response> =>
    await getContainer().auth.handler(request)
