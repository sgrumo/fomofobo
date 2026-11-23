import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createCategory } from "../backoffice-categories/api"
import { buildCategoryCreation } from "../backoffice-categories/utils"
import { authorizeAdmin } from "../oauth/utils"
import { listCategories } from "../public/api"
import { callTool } from "./api"

describe("MCP list_categories", () => {
    it("answers every category, as the public list does", async () => {
        const { headers } = await signInAs("admin")
        expectStatus(
            await createCategory({ headers, body: buildCategoryCreation() }),
            201,
        )
        expectStatus(
            await createCategory({ headers, body: buildCategoryCreation() }),
            201,
        )
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "list_categories")

        const list = await listCategories({})
        expectStatus(list, 200)
        expect(list.data).toHaveLength(2)
        expect(result).toStrictEqual({ isError: false, value: list.data })
    })
})
