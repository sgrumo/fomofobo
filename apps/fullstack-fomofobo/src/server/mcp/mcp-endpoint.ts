import "server-only"
import { requireMcpAuth } from "@better-auth/mcp"
import { createMcpHandler } from "@modelcontextprotocol/server"

import type { Auth } from "../auth/auth"
import type { AuthAccountsService } from "../services/auth-accounts-service"
import { resolveMcpAccount } from "./mcp-account"
import { buildMcpServer } from "./mcp-server"

export interface McpEndpointDependencies {
    auth: Auth
    authAccounts: Pick<AuthAccountsService, "findById" | "revokeSessions">
    resource: string
}

/**
 * @description Builds the handler of the MCP endpoint: bearer token, Admin account, then
 * one stateless MCP exchange
 * @param dependencies Auth library, account reads and the URL of the endpoint
 */
export const buildMcpEndpoint = (
    dependencies: McpEndpointDependencies,
): ((request: Request) => Promise<Response>) =>
    requireMcpAuth(
        dependencies.auth,
        async (request, claims) => {
            const account = await resolveMcpAccount(dependencies.authAccounts, claims.sub)
            const handler = createMcpHandler(() => buildMcpServer(account), {
                keepAliveMs: 0,
            })
            try {
                return await handler.fetch(request)
            } finally {
                await handler.close()
            }
        },
        { resource: dependencies.resource },
    )
