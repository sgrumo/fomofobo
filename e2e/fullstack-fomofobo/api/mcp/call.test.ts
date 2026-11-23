import axios from "axios"
import { expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"
import { z } from "zod"

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

    it("sends the playbook at the handshake, and every tool that it names exists", async () => {
        const { tokens } = await authorizeAdmin()

        const handshake = await callMcp(tokens.access_token, "initialize", {
            protocolVersion: "2025-06-18",
            capabilities: {},
            clientInfo: { name: "e2e", version: "1.0.0" },
        })
        expectStatus(handshake, 200)
        const list = await callMcp(tokens.access_token, "tools/list")
        expectStatus(list, 200)

        const { instructions } = z
            .object({ result: z.object({ instructions: z.string() }) })
            .parse(rpcMessageOf(handshake.data)).result
        const listed = new Set(
            z
                .object({
                    result: z.object({ tools: z.array(z.object({ name: z.string() })) }),
                })
                .parse(rpcMessageOf(list.data))
                .result.tools.map(tool => tool.name),
        )
        const named = new Set(instructions.match(/\b[a-z]+_[a-z_]+\b/gu))
        expect(named).toContain("create_event")
        expect([...named].filter(name => !listed.has(name))).toStrictEqual([])
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
