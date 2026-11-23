import "server-only"

const MCP_PATH = "/api/mcp"

/**
 * @description Returns the URL of the MCP endpoint, which the OAuth tokens name as their audience
 * @param baseUrl Origin of the app
 * @remarks Equals the connector URL that a user types in claude.ai, or the discovery fails
 */
export const mcpResourceUrl = (baseUrl: string): string =>
    new URL(MCP_PATH, baseUrl).toString()
