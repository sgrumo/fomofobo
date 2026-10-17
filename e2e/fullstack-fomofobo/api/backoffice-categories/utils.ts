import { faker } from "@faker-js/faker"
import type { CategoryCreation } from "models"
import { categoryIconValues } from "models"

/**
 * @description Builds the payload of a category with a unique name
 */
export const buildCategoryCreation = (): CategoryCreation => ({
    name: `${faker.music.genre()} ${crypto.randomUUID().slice(0, 8)}`,
    icon: faker.helpers.arrayElement(categoryIconValues),
})
