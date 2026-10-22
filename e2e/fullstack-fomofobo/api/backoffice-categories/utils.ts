import { faker } from "@faker-js/faker"
import { expectRawStatus, expectStatus } from "e2e-kit/assertions"
import type { CategoryCreation } from "models"
import { categoryIconValues } from "models"

import { signInAs } from "../auth/utils"
import { createCategoryImageUploadTicket } from "./api"

/**
 * @description Builds the payload of a category with a unique name
 */
export const buildCategoryCreation = (): CategoryCreation => ({
    name: `${faker.music.genre()} ${crypto.randomUUID().slice(0, 8)}`,
    icon: faker.helpers.arrayElement(categoryIconValues),
})

/**
 * @description Uploads random bytes through an image ticket of the category, as an Admin, and returns the key and the bytes
 * @param categoryId Category whose image is uploaded
 */
export const uploadCategoryImage = async (
    categoryId: string,
): Promise<{ key: string; bytes: Uint8Array }> => {
    const { headers } = await signInAs("admin")
    const bytes = crypto.getRandomValues(new Uint8Array(256))
    const ticket = await createCategoryImageUploadTicket({
        headers,
        pathParams: { id: categoryId },
        body: { fileName: "category.png", contentType: "image/png", sizeBytes: 256 },
    })
    expectStatus(ticket, 200)
    const upload = await fetch(ticket.data.url, {
        method: "PUT",
        headers: ticket.data.headers,
        body: bytes,
    })
    expectRawStatus(upload, 200)
    return { key: ticket.data.key, bytes }
}
