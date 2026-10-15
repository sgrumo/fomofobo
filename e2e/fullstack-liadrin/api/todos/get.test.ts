import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { mockFutureIsoDate } from "e2e-kit/mocks"
import { describe, expect, it } from "vitest"

import { createTodo, getTodoById } from "./api"
import { mockTodoCreation } from "./utils"

describe("todo Get By ID", () => {
    it("should return a todo by its ID", async () => {
        const data = mockTodoCreation({
            description: "Call before noon",
            endDate: mockFutureIsoDate(),
        })
        const createRes = await createTodo({ body: data })
        expectStatus(createRes, 201)

        const res = await getTodoById({ pathParams: { id: createRes.data.id } })
        expectStatus(res, 200)

        expect(res.data).toStrictEqual({
            id: createRes.data.id,
            title: data.title,
            description: data.description,
            completed: false,
            endDate: data.endDate,
        })
    })

    it("should return 404 for non-existent todo", async () => {
        const res = await getTodoById({ pathParams: { id: crypto.randomUUID() } })
        expectApiError(res, 404, { code: "ItemNotFound" })
    })
})
