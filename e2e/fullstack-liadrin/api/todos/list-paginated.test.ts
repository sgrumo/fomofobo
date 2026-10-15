import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { createTodo, listTodosPaginated, updateTodo } from "./api"
import { mockTodoCreation } from "./utils"

describe("todo List (paginated)", () => {
    it("returns the first page with the default size, ordered by id", async () => {
        const created = await Promise.all(
            Array.from({ length: 3 }, () => createTodo({ body: mockTodoCreation() })),
        )
        const todos = created.map(res => {
            expectStatus(res, 201)
            return res.data
        })

        const res = await listTodosPaginated({})
        expectStatus(res, 200)

        expect(res.data).toStrictEqual({
            items: todos.toSorted((a, b) => (a.id < b.id ? -1 : 1)),
            page: 1,
            pageSize: 20,
            total: 3,
            totalPages: 1,
        })
    })

    it("returns the window of the requested page", async () => {
        const created = await Promise.all(
            Array.from({ length: 5 }, () => createTodo({ body: mockTodoCreation() })),
        )
        const todos = created.map(res => {
            expectStatus(res, 201)
            return res.data
        })

        const res = await listTodosPaginated({ queryParams: { page: 2, pageSize: 2 } })
        expectStatus(res, 200)

        expect(res.data).toStrictEqual({
            items: todos.toSorted((a, b) => (a.id < b.id ? -1 : 1)).slice(2, 4),
            page: 2,
            pageSize: 2,
            total: 5,
            totalPages: 3,
        })
    })

    it("returns no item past the last page", async () => {
        const created = await createTodo({ body: mockTodoCreation() })
        expectStatus(created, 201)

        const res = await listTodosPaginated({ queryParams: { page: 2, pageSize: 1 } })
        expectStatus(res, 200)

        expect(res.data).toStrictEqual({
            items: [],
            page: 2,
            pageSize: 1,
            total: 1,
            totalPages: 1,
        })
    })

    it("filters by completion status", async () => {
        const open = await createTodo({ body: mockTodoCreation() })
        expectStatus(open, 201)
        const done = await createTodo({ body: mockTodoCreation() })
        expectStatus(done, 201)
        const completed = await updateTodo({
            pathParams: { id: done.data.id },
            body: { completed: true },
        })
        expectStatus(completed, 200)

        const completedRes = await listTodosPaginated({
            queryParams: { completed: "true" },
        })
        expectStatus(completedRes, 200)
        expect(completedRes.data).toMatchObject({ items: [completed.data], total: 1 })

        const openRes = await listTodosPaginated({ queryParams: { completed: "false" } })
        expectStatus(openRes, 200)
        expect(openRes.data).toMatchObject({ items: [open.data], total: 1 })
    })
})
