import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"
import { z } from "zod"

import { authorizeAdmin } from "../oauth/utils"
import { callMcp, rpcMessageOf } from "./api"

const toolListSchema = z.object({
    result: z.object({
        tools: z.array(
            z.object({
                name: z.string(),
                annotations: z.record(z.string(), z.unknown()),
            }),
        ),
    }),
})

describe("MCP tools/list", () => {
    it("lists the read tools of the backoffice, each marked read-only", async () => {
        const { tokens } = await authorizeAdmin()

        const res = await callMcp(tokens.access_token, "tools/list")
        expectStatus(res, 200)

        const tools = toolListSchema.parse(rpcMessageOf(res.data)).result.tools
        expect(tools.map(tool => tool.name).toSorted()).toStrictEqual([
            "get_event",
            "list_categories",
            "list_events",
            "search_organizers",
            "search_places",
            "search_venues",
        ])
        expect(tools.every(tool => tool.annotations.readOnlyHint === true)).toBe(true)
    })
})
