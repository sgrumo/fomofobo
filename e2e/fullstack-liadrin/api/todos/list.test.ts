import { faker } from "@faker-js/faker"
import { expectStatus } from "e2e-kit/assertions"
import { mockFutureIsoDate } from "e2e-kit/mocks"
import { describe, expect, it } from "vitest"

import { createTodo, getTodos } from "./api"
import { mockTodoCreation } from "./utils"

describe("todo List", () => {
    it("should return every todo", async () => {
        const first = await createTodo({
            body: mockTodoCreation({
                description: faker.lorem.sentence(),
                endDate: mockFutureIsoDate(),
            }),
        })
        expectStatus(first, 201)
        const second = await createTodo({ body: mockTodoCreation() })
        expectStatus(second, 201)

        const res = await getTodos({})
        expectStatus(res, 200)

        expect(res.data).toHaveLength(2)
        expect(res.data).toStrictEqual(expect.arrayContaining([first.data, second.data]))
    })

    it("should return an empty list when no todo exists", async () => {
        const res = await getTodos({})
        expectStatus(res, 200)

        expect(res.data).toStrictEqual([])
    })
})
