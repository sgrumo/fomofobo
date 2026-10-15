import { faker } from "@faker-js/faker"
import type { TodoCreation, TodoUpdate } from "models"

/**
 * @description Builds a todo creation payload with a random title
 * @param overrides Fields replacing the defaults
 */
export const mockTodoCreation = (overrides?: Partial<TodoCreation>): TodoCreation => ({
    title: faker.lorem.words(3),
    ...overrides,
})

/**
 * @description Builds a todo update payload with a random title
 * @param overrides Fields replacing the defaults
 */
export const mockTodoUpdate = (overrides?: Partial<TodoUpdate>): TodoUpdate => ({
    title: faker.lorem.words(3),
    ...overrides,
})
