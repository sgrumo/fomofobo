import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createCategory } from "../backoffice-categories/api"
import { buildCategoryCreation } from "../backoffice-categories/utils"
import { seedEvent, seedEventReferences } from "../backoffice-events/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool, toolValueOf } from "./api"

describe("MCP delete_category", () => {
    it("deletes a category that nothing uses", async () => {
        const { headers } = await signInAs("admin")
        const created = await createCategory({ headers, body: buildCategoryCreation() })
        expectStatus(created, 201)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "delete_category", {
            categoryId: created.data.id,
        })

        expect(result).toStrictEqual({
            isError: false,
            value: { deletedCategoryId: created.data.id },
        })
        expect(
            toolValueOf(await callTool(tokens.access_token, "list_categories")),
        ).not.toContainEqual(created.data)
    })

    it("answers a category in use as a tool error that names the code", async () => {
        const organizer = await signInAs("organizer")
        const refs = await seedEventReferences()
        await seedEvent(organizer.headers, refs)
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "delete_category", {
            categoryId: refs.categoryId,
        })

        expect(result).toStrictEqual({
            isError: true,
            text: expect.stringMatching(/^CategoryInUse: /u),
        })
    })
})
