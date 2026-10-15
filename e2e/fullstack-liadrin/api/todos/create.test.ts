import { faker } from "@faker-js/faker"
import { expectStatus } from "e2e-kit/assertions"
import { anyUuid } from "e2e-kit/matchers"
import { mockFutureIsoDate } from "e2e-kit/mocks"
import { describe, expect, it } from "vitest"

import { createTodo, getTodoById } from "./api"
import { mockTodoCreation } from "./utils"

describe("todo Create", () => {
    it("should create a todo", async () => {
        const data = mockTodoCreation({
            description: faker.lorem.sentence(),
            endDate: mockFutureIsoDate(),
        })
        const res = await createTodo({ body: data })
        expectStatus(res, 201)

        expect(res.data).toStrictEqual({
            id: anyUuid,
            title: data.title,
            description: data.description,
            completed: false,
            endDate: data.endDate,
        })

        const getRes = await getTodoById({ pathParams: { id: res.data.id } })
        expectStatus(getRes, 200)
        expect(getRes.data).toStrictEqual(res.data)
    })

    it("should default the optional fields to null", async () => {
        const res = await createTodo({ body: mockTodoCreation() })
        expectStatus(res, 201)

        expect(res.data).toMatchObject({ description: null, endDate: null })
    })
})
