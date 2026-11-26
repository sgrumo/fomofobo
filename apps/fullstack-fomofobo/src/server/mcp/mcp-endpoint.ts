import "server-only"
import { requireMcpAuth } from "@better-auth/mcp"
import { createMcpHandler } from "@modelcontextprotocol/server"

import type { Auth } from "../auth/auth"
import type { AuthAccountsService } from "../services/auth-accounts-service"
import { resolveMcpAccount } from "./mcp-account"
import type { McpServices } from "./mcp-server"
import { buildMcpServer } from "./mcp-server"

export interface McpEndpointDependencies {
    auth: Auth
    authAccounts: Pick<AuthAccountsService, "findById" | "revokeSessions">
    services: McpServices
    resource: string
}

/**
 * @description Builds the handler of the MCP endpoint: bearer token, Admin account, then
 * one stateless MCP exchange
 * @param dependencies Auth library, account reads, backoffice services and the URL of the endpoint
 * @remarks Reads the instant from the server clock, not from the request clock of the
 * API: the handler keeps one token verifier, and its JWKS cache, across requests
 */
export const buildMcpEndpoint = (
    dependencies: McpEndpointDependencies,
): ((request: Request) => Promise<Response>) =>
    requireMcpAuth(
        dependencies.auth,
        async (request, claims) => {
            const call = {
                account: await resolveMcpAccount(dependencies.authAccounts, claims.sub),
                forwardedFor: request.headers.get("x-forwarded-for") ?? undefined,
                now: new Date(),
                appUrl: new URL(dependencies.resource).origin,
            }
            const handler = createMcpHandler(
                () => buildMcpServer(dependencies.services, call),
                { keepAliveMs: 0 },
            )
            try {
                const response = await handler.fetch(request)
                // The tool runs while the SSE body streams: read it whole, so the cache expiries of its write land inside the request
                const body = await response.arrayBuffer()
                return new Response(body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                })
            } finally {
                await handler.close()
            }
        },
        { resource: dependencies.resource },
    )
