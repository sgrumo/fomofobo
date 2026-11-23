import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider"

import { getContainer } from "@/server/container"

// Reads the signing keys and the issuer of the deployment, so the route never prerenders.
export const dynamic = "force-dynamic"

/**
 * @description Answers the RFC 8414 metadata of the OAuth authorization server
 * @param request Request of the client, at the issuer path after the well-known prefix
 */
export const GET = async (request: Request): Promise<Response> =>
    await oauthProviderAuthServerMetadata(getContainer().auth)(request)
