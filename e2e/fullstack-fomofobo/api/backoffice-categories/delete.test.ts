import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { listCategories } from "../public/api"
import { createCategory, deleteCategory } from "./api"
import { buildCategoryCreation } from "./utils"

describe("DELETE /api/backoffice/categories/{id}", () => {
    it("deletes a category that no event uses", async () => {
        const { headers } = await signInAs("admin")
        const created = await createCategory({ headers, body: buildCategoryCreation() })
        expectStatus(created, 201)

        const res = await deleteCategory({ headers, pathParams: { id: created.data.id } })

        expectStatus(res, 204)
        const list = await listCategories({})
        expectStatus(list, 200)
        expect(list.data).toStrictEqual([])
    })

    it("answers 404 for an unknown category", async () => {
        const { headers } = await signInAs("admin")

        const res = await deleteCategory({
            headers,
            pathParams: { id: crypto.randomUUID() },
        })

        expectApiError(res, 404, { code: "CategoryNotFound" })
    })

    it("answers 403 to an Organizer", async () => {
        const { headers } = await signInAs("organizer")

        const res = await deleteCategory({
            headers,
            pathParams: { id: crypto.randomUUID() },
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
