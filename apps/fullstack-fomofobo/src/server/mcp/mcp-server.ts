import "server-only"
import { McpServer } from "@modelcontextprotocol/server"
import type { Account } from "models"

import type { Container } from "../container"
import { MCP_INSTRUCTIONS } from "./mcp-instructions"
import { registerReadTools } from "./mcp-read-tools"
import { registerWriteTools } from "./mcp-write-tools"

export type McpServices = Pick<
    Container,
    "categories" | "events" | "organizers" | "places" | "venues"
>

export interface McpCall {
    account: Account
    forwardedFor: string | undefined
    now: Date
    appUrl: string
}

/**
 * @description Builds the MCP server of one request, with the backoffice tools of the account
 * @param services Services that the routers of the backoffice call
 * @param call Account, client address, instant and origin of the request
 */
export const buildMcpServer = (services: McpServices, call: McpCall): McpServer => {
    const server = new McpServer(
        { name: "zonzo-backoffice", version: "1.0.0" },
        { instructions: MCP_INSTRUCTIONS },
    )
    registerReadTools(server, services, call)
    registerWriteTools(server, services, call)
    return server
}
