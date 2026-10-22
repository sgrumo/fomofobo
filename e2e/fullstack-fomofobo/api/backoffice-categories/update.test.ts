import { expectApiError, expectStatus, expectToBeDefined } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { downloadPhoto, uploadPhoto } from "../backoffice-events/utils"
import { listCategories } from "../public/api"
import { createCategory, updateCategory } from "./api"
import { buildCategoryCreation, uploadCategoryImage } from "./utils"

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
        expect(res.data).toStrictEqual({ id: created.data.id, ...change, imageUrl: null })
        const list = await listCategories({})
        expectStatus(list, 200)
        expect(list.data).toStrictEqual([res.data])
    })

    it("stores an image uploaded through the ticket, replaces it, then removes it", async () => {
        const { headers } = await signInAs("admin")
        const created = await createCategory({ headers, body: buildCategoryCreation() })
        expectStatus(created, 201)
        const [first, second] = await Promise.all([
            uploadCategoryImage(created.data.id),
            uploadCategoryImage(created.data.id),
        ])

        const withFirst = await updateCategory({
            headers,
            pathParams: { id: created.data.id },
            body: { imageKey: first.key },
        })

        expectStatus(withFirst, 200)
        const firstUrl = withFirst.data.imageUrl
        expectToBeDefined(firstUrl)
        expect(await downloadPhoto(firstUrl)).toStrictEqual(first.bytes)
        const withSecond = await updateCategory({
            headers,
            pathParams: { id: created.data.id },
            body: { imageKey: second.key },
        })
        expectStatus(withSecond, 200)
        const secondUrl = withSecond.data.imageUrl
        expectToBeDefined(secondUrl)
        const list = await listCategories({})
        expectStatus(list, 200)
        expect(list.data).toStrictEqual([withSecond.data])
        expect(await downloadPhoto(firstUrl)).toBeNull()
        const withoutImage = await updateCategory({
            headers,
            pathParams: { id: created.data.id },
            body: { imageKey: null },
        })
        expectStatus(withoutImage, 200)
        expect(withoutImage.data.imageUrl).toBeNull()
        expect(await downloadPhoto(secondUrl)).toBeNull()
    })

    it("answers 400 to an image key outside the uploads of the category", async () => {
        const { headers } = await signInAs("admin")
        const created = await createCategory({ headers, body: buildCategoryCreation() })
        expectStatus(created, 201)
        const eventPhoto = await uploadPhoto(headers)

        const res = await updateCategory({
            headers,
            pathParams: { id: created.data.id },
            body: { imageKey: eventPhoto.key },
        })

        expectApiError(res, 400, { code: "InvalidPhotoUpload" })
    })

    it("accepts the name that the category already holds", async () => {
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
