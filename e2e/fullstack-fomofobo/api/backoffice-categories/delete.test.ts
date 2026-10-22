import { expectApiError, expectStatus, expectToBeDefined } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createEvent, deleteEvent } from "../backoffice-events/api"
import {
    buildEventUpsert,
    downloadPhoto,
    seedEventReferences,
    uploadPhoto,
} from "../backoffice-events/utils"
import { createVenue, setVenueKind } from "../backoffice-venues/api"
import { buildCinemaKind, buildVenueCreation } from "../backoffice-venues/utils"
import { listCategories } from "../public/api"
import { createCategory, deleteCategory, updateCategory } from "./api"
import { buildCategoryCreation, uploadCategoryImage } from "./utils"

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

    it("deletes the image of a deleted category from the bucket", async () => {
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
        const imageUrl = withImage.data.imageUrl
        expectToBeDefined(imageUrl)

        const res = await deleteCategory({ headers, pathParams: { id: created.data.id } })

        expectStatus(res, 204)
        expect(await downloadPhoto(imageUrl)).toBeNull()
    })

    it("deletes a category that only deleted events use", async () => {
        const admin = await signInAs("admin")
        const organizer = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(organizer.headers)
        const event = await createEvent({
            headers: organizer.headers,
            body: buildEventUpsert({ venueId, categoryId, photoKeys: [photo.key] }),
        })
        expectStatus(event, 201)
        expectStatus(
            await deleteEvent({
                headers: organizer.headers,
                pathParams: { id: event.data.id },
            }),
            204,
        )

        const res = await deleteCategory({
            headers: admin.headers,
            pathParams: { id: categoryId },
        })

        expectStatus(res, 204)
    })

    it("answers 409 while an event in place uses the category", async () => {
        const admin = await signInAs("admin")
        const organizer = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const photo = await uploadPhoto(organizer.headers)
        expectStatus(
            await createEvent({
                headers: organizer.headers,
                body: buildEventUpsert({ venueId, categoryId, photoKeys: [photo.key] }),
            }),
            201,
        )

        const res = await deleteCategory({
            headers: admin.headers,
            pathParams: { id: categoryId },
        })

        expectApiError(res, 409, { code: "CategoryInUse" })
    })

    it("answers 409 while a permanent venue uses the category", async () => {
        const { headers } = await signInAs("admin")
        const category = await createCategory({ headers, body: buildCategoryCreation() })
        const venue = await createVenue({ headers, body: buildVenueCreation() })
        expectStatus(category, 201)
        expectStatus(venue, 201)
        expectStatus(
            await setVenueKind({
                headers,
                pathParams: { id: venue.data.id },
                body: buildCinemaKind(category.data.id),
            }),
            200,
        )

        const res = await deleteCategory({
            headers,
            pathParams: { id: category.data.id },
        })

        expectApiError(res, 409, { code: "CategoryInUse" })
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
