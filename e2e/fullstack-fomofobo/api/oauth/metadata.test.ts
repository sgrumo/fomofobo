import axios from "axios"
import { expectStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"

import { mcpResourceUrl } from "./utils"

describe("OAuth metadata documents", () => {
    it("publish the authorization server at the issuer path, with PKCE and metadata documents", async () => {
        const issuer = `${publishedAppUrl()}/api/auth`

        const res = await axios.get(
            `${publishedAppUrl()}/.well-known/oauth-authorization-server/api/auth`,
            { validateStatus: () => true },
        )
        expectStatus(res, 200)

        expect(res.data).toMatchObject({
            issuer,
            authorization_endpoint: `${issuer}/oauth2/authorize`,
            token_endpoint: `${issuer}/oauth2/token`,
            code_challenge_methods_supported: ["S256"],
            client_id_metadata_document_supported: true,
        })
    })

    it("publish the MCP endpoint as a resource of that authorization server", async () => {
        const res = await axios.get(
            `${publishedAppUrl()}/.well-known/oauth-protected-resource/api/mcp`,
            { validateStatus: () => true },
        )
        expectStatus(res, 200)

        expect(res.data).toMatchObject({
            resource: mcpResourceUrl(),
            authorization_servers: [`${publishedAppUrl()}/api/auth`],
        })
    })
})
