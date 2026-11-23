import "server-only"
import { McpServer } from "@modelcontextprotocol/server"
import type { Account } from "models"

/**
 * @description Builds the MCP server of one request of an Admin account
 * @param _account Admin account of the request
 */
export const buildMcpServer = (_account: Account): McpServer =>
    new McpServer({ name: "zonzo-backoffice", version: "1.0.0" })
