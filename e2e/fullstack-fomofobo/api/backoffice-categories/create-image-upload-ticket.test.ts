import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { anyHttpUrl } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createCategory, createCategoryImageUploadTicket } from "./api"
import { buildCategoryCreation } from "./utils"

const imageRequest = {
    fileName: "category.png",
    contentType: "image/png",
    sizeBytes: 128,
} as const

describe("POST /api/backoffice/categories/{id}/image/upload-ticket", () => {
    it("answers a presigned PUT under a key of the category", async () => {
        const { headers } = await signInAs("admin")
        const created = await createCategory({ headers, body: buildCategoryCreation() })
        expectStatus(created, 201)

        const res = await createCategoryImageUploadTicket({
            headers,
            pathParams: { id: created.data.id },
            body: imageRequest,
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            url: anyHttpUrl,
            headers: { "Content-Type": "image/png" },
            key: expect.stringMatching(
                new RegExp(`^categories/${created.data.id}/[0-9a-f-]{36}$`, "u"),
            ),
        })
    })

    it("answers 404 for an unknown category", async () => {
        const { headers } = await signInAs("admin")

        const res = await createCategoryImageUploadTicket({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: imageRequest,
        })

        expectApiError(res, 404, { code: "CategoryNotFound" })
    })

    it("answers 403 to an Organizer", async () => {
        const { headers } = await signInAs("organizer")

        const res = await createCategoryImageUploadTicket({
            headers,
            pathParams: { id: crypto.randomUUID() },
            body: imageRequest,
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
