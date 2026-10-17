import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { listCategories } from "../public/api"
import { createCategory, updateCategory } from "./api"
import { buildCategoryCreation } from "./utils"

describe("PATCH /api/backoffice/categories/{id}", () => {
    it("changes the name and the icon", async () => {
        const { headers } = await signInAs("admin")
        const created = await createCategory({ headers, body: buildCategoryCreation() })
        expectStatus(created, 201)
        const change = buildCategoryCreation()

        const res = await updateCategory({
            headers,
            pathParams: { id: created.data.id },
            body: change,
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({ id: created.data.id, ...change })
        const list = await listCategories({})
        expectStatus(list, 200)
        expect(list.data).toStrictEqual([res.data])
    })

    it("keeps its own name when the name does not change", async () => {
        const { headers } = await signInAs("admin")
        const created = await createCategory({ headers, body: buildCategoryCreation() })
        expectStatus(created, 201)

        const res = await updateCategory({
            headers,
            pathParams: { id: created.data.id },
            body: { name: created.data.name, icon: "other" },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({ ...created.data, icon: "other" })
    })

    it("answers 409 when another category has the name", async () => {
        const { headers } = await signInAs("admin")
        const first = await createCategory({ headers, body: buildCategoryCreation() })
        const second = await createCategory({ headers, body: buildCategoryCreation() })
        expectStatus(first, 201)
        expectStatus(second, 201)

        const res = await updateCategory({
            headers,
            pathParams: { id: second.data.id },
            body: { name: first.data.name },
        })

        expectApiError(res, 409, { code: "CategoryNameTaken" })
    })

    it("answers 404 for an unknown category", async () => {
        const { headers } = await signInAs("admin")

        const res = await updateCategory({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: { icon: "other" },
        })

        expectApiError(res, 404, { code: "CategoryNotFound" })
    })

    it("answers 403 to an Organizer", async () => {
        const { headers } = await signInAs("organizer")

        const res = await updateCategory({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: { icon: "other" },
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
