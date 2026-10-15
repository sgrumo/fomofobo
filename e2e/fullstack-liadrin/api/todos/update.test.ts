import { faker } from "@faker-js/faker"
import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { mockFutureIsoDate } from "e2e-kit/mocks"
import { describe, expect, it } from "vitest"

import { createTodo, getTodoById, updateTodo } from "./api"
import { mockTodoCreation, mockTodoUpdate } from "./utils"

describe("todo Update", () => {
    it("should update every field", async () => {
        const createRes = await createTodo({ body: mockTodoCreation() })
        expectStatus(createRes, 201)

        const update = mockTodoUpdate({
            description: faker.lorem.sentence(),
            endDate: mockFutureIsoDate(),
            completed: true,
        })
        const res = await updateTodo({
            pathParams: { id: createRes.data.id },
            body: update,
        })
        expectStatus(res, 200)

        expect(res.data).toStrictEqual({ id: createRes.data.id, ...update })

        const getRes = await getTodoById({ pathParams: { id: createRes.data.id } })
        expectStatus(getRes, 200)
        expect(getRes.data).toStrictEqual(res.data)
    })

    it("should keep the fields the update leaves out", async () => {
        const createRes = await createTodo({
            body: mockTodoCreation({
                description: faker.lorem.sentence(),
                endDate: mockFutureIsoDate(),
            }),
        })
        expectStatus(createRes, 201)

        const res = await updateTodo({
            pathParams: { id: createRes.data.id },
            body: { completed: true },
        })
        expectStatus(res, 200)

        expect(res.data).toStrictEqual({ ...createRes.data, completed: true })
    })

    it("should clear description and end date with null", async () => {
        const createRes = await createTodo({
            body: mockTodoCreation({
                description: faker.lorem.sentence(),
                endDate: mockFutureIsoDate(),
            }),
        })
        expectStatus(createRes, 201)

        const res = await updateTodo({
            pathParams: { id: createRes.data.id },
            body: { description: null, endDate: null },
        })
        expectStatus(res, 200)

        expect(res.data).toMatchObject({ description: null, endDate: null })
    })

    it("should return 404 for a non-existent todo", async () => {
        const res = await updateTodo({
            pathParams: { id: crypto.randomUUID() },
            body: mockTodoUpdate(),
        })
        expectApiError(res, 404, { code: "ItemNotFound" })
    })
})
