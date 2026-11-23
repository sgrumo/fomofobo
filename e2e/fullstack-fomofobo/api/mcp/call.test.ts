import axios from "axios"
import { expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"

import { authorizeAdmin, mcpResourceUrl } from "../oauth/utils"
import { callMcp, rpcMessageOf } from "./api"

describe("POST /api/mcp", () => {
    it("challenges a call with no token toward the resource metadata", async () => {
        const res = await callMcp(undefined, "tools/list")

        expectRawStatus(res, 401)
        expect(res.headers["www-authenticate"]).toContain(
            `resource_metadata="${publishedAppUrl()}/.well-known/oauth-protected-resource/api/mcp"`,
        )
    })

    it("challenges a call with a token that the server never signed", async () => {
        const res = await callMcp("not-a-token", "tools/list")

        expectRawStatus(res, 401)
        expect(res.headers["www-authenticate"]).toContain("resource_metadata=")
    })

    it("serves an Admin token: the handshake names the server", async () => {
        const { tokens } = await authorizeAdmin()

        const res = await callMcp(tokens.access_token, "initialize", {
            protocolVersion: "2025-06-18",
            capabilities: {},
            clientInfo: { name: "e2e", version: "1.0.0" },
        })
        expectStatus(res, 200)

        expect(rpcMessageOf(res.data)).toMatchObject({
            jsonrpc: "2.0",
            id: 1,
            result: { serverInfo: { name: "zonzo-backoffice" } },
        })
    })

    it("answers 405 to a GET, which a stateless endpoint has no stream for", async () => {
        const { tokens } = await authorizeAdmin()

        const res = await axios.get(mcpResourceUrl(), {
            headers: {
                Accept: "text/event-stream",
                Authorization: `Bearer ${tokens.access_token}`,
            },
            validateStatus: () => true,
        })

        expectRawStatus(res, 405)
    })
})
