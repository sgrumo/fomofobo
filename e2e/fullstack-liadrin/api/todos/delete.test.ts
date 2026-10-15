import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { createTodo, deleteTodo, getTodoById, getTodos } from "./api"
import { mockTodoCreation } from "./utils"

describe("todo Delete", () => {
    it("should delete an existing todo", async () => {
        const createRes = await createTodo({ body: mockTodoCreation() })
        expectStatus(createRes, 201)

        const deleteRes = await deleteTodo({
            pathParams: { id: createRes.data.id },
        })
        expectStatus(deleteRes, 204)

        const getRes = await getTodoById({ pathParams: { id: createRes.data.id } })
        expectApiError(getRes, 404, { code: "ItemNotFound" })

        const listRes = await getTodos({})
        expectStatus(listRes, 200)
        expect(listRes.data).toStrictEqual([])
    })

    it("should return 204 when deleting a non-existent todo", async () => {
        const res = await deleteTodo({ pathParams: { id: crypto.randomUUID() } })
        expectStatus(res, 204)
    })
})
