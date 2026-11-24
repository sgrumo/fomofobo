import "server-only"

export const CIMD_METADATA_PROFILE = "mcp-2026-07-28"

const CLIENT_METADATA_ORIGINS = new Set(["https://claude.ai"])

/**
 * @remarks Bounds the write access of a leaked JWT, which outlives the token rows that a password reset deletes.
 */
export const MCP_ACCESS_TOKEN_SECONDS = 15 * 60

/**
 * @description True when the client id URL of a Client ID Metadata Document belongs to a client that the app serves
 * @param clientIdUrl Client id that an authorization request names
 */
export const isAllowedClientMetadataUrl = (clientIdUrl: string): boolean =>
    CLIENT_METADATA_ORIGINS.has(URL.parse(clientIdUrl)?.origin ?? "")
