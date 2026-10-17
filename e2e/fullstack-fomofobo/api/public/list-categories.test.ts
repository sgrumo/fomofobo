import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createCategory } from "../backoffice-categories/api"
import { buildCategoryCreation } from "../backoffice-categories/utils"
import { listCategories } from "./api"

describe("GET /api/public/categories", () => {
    it("lists every category by name, without a session", async () => {
        const { headers } = await signInAs("admin")
        const created = await Promise.all(
            ["Teatro", "Arte", "Musica"].map(async name => {
                const res = await createCategory({
                    headers,
                    body: { ...buildCategoryCreation(), name },
                })
                expectStatus(res, 201)
                return res.data
            }),
        )

        const res = await listCategories({})

        expectStatus(res, 200)
        expect(res.data).toStrictEqual(
            created.toSorted((a, b) => a.name.localeCompare(b.name)),
        )
    })
})
