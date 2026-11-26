import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createCategory, updateCategory } from "../backoffice-categories/api"
import {
    buildCategoryCreation,
    uploadCategoryImage,
} from "../backoffice-categories/utils"
import { authorizeAdmin } from "../oauth/utils"
import { callTool } from "./api"

describe("MCP update_category", () => {
    it("renames the category and removes its image, and keeps its icon", async () => {
        const { headers } = await signInAs("admin")
        const created = await createCategory({ headers, body: buildCategoryCreation() })
        expectStatus(created, 201)
        const image = await uploadCategoryImage(created.data.id)
        const withImage = await updateCategory({
            headers,
            pathParams: { id: created.data.id },
            body: { imageKey: image.key },
        })
        expectStatus(withImage, 200)
        const name = `Jazz ${crypto.randomUUID().slice(0, 8)}`
        const { tokens } = await authorizeAdmin()

        const result = await callTool(tokens.access_token, "update_category", {
            categoryId: created.data.id,
            changes: { name, removeImage: true },
        })

        expect(result).toStrictEqual({
            isError: false,
            value: { ...created.data, name, imageUrl: null },
        })
    })
})
