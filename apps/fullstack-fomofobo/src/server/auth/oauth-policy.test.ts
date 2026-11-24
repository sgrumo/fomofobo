import { validateCimdMetadata } from "@better-auth/cimd"
import { describe, expect, it } from "vitest"

import { CIMD_METADATA_PROFILE, isAllowedClientMetadataUrl } from "./oauth-policy"

const claudeClientId = "https://claude.ai/oauth/mcp-oauth-client-metadata"

const claudeMetadata = {
    client_id: claudeClientId,
    client_name: "Claude",
    client_uri: "https://claude.ai",
    redirect_uris: ["https://claude.ai/api/mcp/auth_callback"],
    grant_types: [
        "authorization_code",
        "refresh_token",
        "urn:ietf:params:oauth:grant-type:jwt-bearer",
    ],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
}

describe("isAllowedClientMetadataUrl", () => {
    it("should allow the metadata document of claude.ai", () => {
        expect(isAllowedClientMetadataUrl(claudeClientId)).toBe(true)
    })

    it("should refuse every other origin, a look-alike host included", () => {
        expect(
            [
                "https://evil.example/oauth/mcp-oauth-client-metadata",
                "https://claude.ai.evil.example/oauth/mcp-oauth-client-metadata",
                "https://evil.claude.ai/oauth/mcp-oauth-client-metadata",
                "http://claude.ai/oauth/mcp-oauth-client-metadata",
                "not a url",
            ].filter(isAllowedClientMetadataUrl),
        ).toStrictEqual([])
    })
})

describe("claude.ai metadata document", () => {
    it("should pass the metadata profile of the server", () => {
        expect(
            validateCimdMetadata(claudeClientId, claudeMetadata, {
                metadataProfile: CIMD_METADATA_PROFILE,
            }),
        ).toMatchObject({ valid: true })
    })
})
