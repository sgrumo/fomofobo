import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { anyUuid } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { listCategories } from "../public/api"
import { createCategory } from "./api"
import { buildCategoryCreation } from "./utils"

describe("POST /api/backoffice/categories", () => {
    it("creates a category that the public list shows", async () => {
        const { headers } = await signInAs("admin")
        const creation = buildCategoryCreation()

        const res = await createCategory({ headers, body: creation })

        expectStatus(res, 201)
        expect(res.data).toStrictEqual({ id: anyUuid, ...creation })
        const list = await listCategories({})
        expectStatus(list, 200)
        expect(list.data).toStrictEqual([res.data])
    })

    it("answers 409 when another category has the name", async () => {
        const { headers } = await signInAs("admin")
        const creation = buildCategoryCreation()
        expectStatus(await createCategory({ headers, body: creation }), 201)

        const res = await createCategory({
            headers,
            body: { ...buildCategoryCreation(), name: creation.name },
        })

        expectApiError(res, 409, { code: "CategoryNameTaken" })
    })

    it("answers 403 to an Organizer", async () => {
        const { headers } = await signInAs("organizer")

        const res = await createCategory({ headers, body: buildCategoryCreation() })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })

    it("answers 401 without a session", async () => {
        const res = await createCategory({ body: buildCategoryCreation() })

        expectApiError(res, 401, { code: "Unauthenticated" })
    })
})
