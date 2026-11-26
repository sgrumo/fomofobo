import { anyUuid } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { buildCategoryCreation } from "../backoffice-categories/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool, toolValueOf } from "./api"

describe("MCP create_category", () => {
    it("creates the category, which list_categories then lists", async () => {
        const creation = buildCategoryCreation()
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "create_category", creation)

        const created = { id: anyUuid, ...creation, imageUrl: null }
        expect(result).toStrictEqual({ isError: false, value: created })
        expect(
            toolValueOf(await callTool(tokens.access_token, "list_categories")),
        ).toContainEqual(created)
    })

    it("answers a taken name as a tool error that names the code", async () => {
        const creation = buildCategoryCreation()
        const { tokens } = await authorizeAdmin()
        toolValueOf(await callTool(tokens.access_token, "create_category", creation))

        const result = await callTool(tokens.access_token, "create_category", creation)

        expect(result).toStrictEqual({
            isError: true,
            text: expect.stringMatching(/^CategoryNameTaken: /u),
        })
    })
})
