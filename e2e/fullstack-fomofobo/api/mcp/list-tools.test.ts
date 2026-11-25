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
    it("lists the tools of the backoffice, the writes marked destructive", async () => {
        const { tokens } = await authorizeAdmin()

        const res = await callMcp(tokens.access_token, "tools/list")
        expectStatus(res, 200)

        const tools = toolListSchema.parse(rpcMessageOf(res.data)).result.tools
        expect(
            tools
                .map(tool => ({
                    name: tool.name,
                    readOnly: tool.annotations.readOnlyHint,
                    destructive: tool.annotations.destructiveHint,
                }))
                .toSorted((left, right) => left.name.localeCompare(right.name)),
        ).toStrictEqual([
            { name: "create_event", readOnly: false, destructive: true },
            { name: "create_venue", readOnly: false, destructive: true },
            { name: "get_event", readOnly: true, destructive: undefined },
            { name: "list_categories", readOnly: true, destructive: undefined },
            { name: "list_events", readOnly: true, destructive: undefined },
            { name: "search_organizers", readOnly: true, destructive: undefined },
            { name: "search_places", readOnly: true, destructive: undefined },
            { name: "search_venues", readOnly: true, destructive: undefined },
            { name: "update_event", readOnly: false, destructive: true },
            { name: "update_venue", readOnly: false, destructive: true },
        ])
    })
})
