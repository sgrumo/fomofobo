import { z } from "@hono/zod-openapi"
import { TodoRoutes } from "api-routes"
import { describe, expect, it, vi } from "vitest"

import type { ApiRequest } from "./client"
import { createEndpointFactories } from "./client"

const todo = {
    id: "3f1a6d2e-9b7c-4c1f-8a2d-5e6f7a8b9c0d",
    title: "Buy milk",
    description: null,
    completed: false,
    endDate: null,
}

/**
 * @description Builds endpoint factories and the request stub resolving the response
 * @param response Value resolved by the request stub
 */
const factoriesReturning = (response: unknown) => {
    const request = vi.fn<(request: ApiRequest) => Promise<unknown>>(() =>
        Promise.resolve(response),
    )
    return { request, ...createEndpointFactories({ request }) }
}

describe("bodylessQueryEndpoint", () => {
    it("substitutes path params and forwards the query", async () => {
        const { request, bodylessQueryEndpoint } = factoriesReturning(todo)

        await bodylessQueryEndpoint(
            TodoRoutes.getById,
            200,
        )({
            params: { id: todo.id },
            query: {},
        })

        expect(request).toHaveBeenCalledWith({
            method: "get",
            path: `/api/todos/${todo.id}`,
            query: {},
        })
    })

    it("percent-encodes path params", async () => {
        const { request, bodylessQueryEndpoint } = factoriesReturning(todo)

        await bodylessQueryEndpoint(
            TodoRoutes.getById,
            200,
        )({
            params: { id: "a/b?c" },
            query: {},
        })

        expect(request.mock.calls[0]?.[0].path).toBe("/api/todos/a%2Fb%3Fc")
    })

    it("passes pagination query values through", async () => {
        const { request, bodylessQueryEndpoint } = factoriesReturning({
            items: [todo],
            total: 1,
            page: 2,
            pageSize: 5,
            totalPages: 1,
        })

        await bodylessQueryEndpoint(
            TodoRoutes.listPaginated,
            200,
        )({
            params: {},
            query: { page: 2, pageSize: 5, completed: undefined },
        })

        expect(request.mock.calls[0]?.[0].query).toStrictEqual({
            page: 2,
            pageSize: 5,
            completed: undefined,
        })
    })

    it("validates the response against the route schema", async () => {
        const { bodylessQueryEndpoint } = factoriesReturning({ id: todo.id, title: 42 })

        await expect(
            bodylessQueryEndpoint(
                TodoRoutes.getById,
                200,
            )({ params: { id: todo.id }, query: {} }),
        ).rejects.toThrow(z.ZodError)
    })

    it("returns the parsed response", async () => {
        const { bodylessQueryEndpoint } = factoriesReturning([todo])

        await expect(
            bodylessQueryEndpoint(TodoRoutes.getList, 200)({ params: {}, query: {} }),
        ).resolves.toStrictEqual([todo])
    })
})

describe("bodyfulQueryEndpoint", () => {
    it("sends the criteria body with the route's method and path", async () => {
        const { request, bodyfulQueryEndpoint } = factoriesReturning([todo])

        await bodyfulQueryEndpoint(
            TodoRoutes.search,
            200,
        )({
            params: {},
            body: { text: "milk", completed: false, ids: [todo.id] },
        })

        expect(request).toHaveBeenCalledWith({
            method: "query",
            path: "/api/todos/search",
            body: { text: "milk", completed: false, ids: [todo.id] },
        })
    })

    it("omits the criteria the caller leaves out", async () => {
        const { request, bodyfulQueryEndpoint } = factoriesReturning([])

        await bodyfulQueryEndpoint(TodoRoutes.search, 200)({ params: {}, body: {} })

        expect(request.mock.calls[0]?.[0].body).toStrictEqual({})
    })

    it("validates the response against the route schema", async () => {
        const { bodyfulQueryEndpoint } = factoriesReturning([{ id: todo.id, title: 42 }])

        await expect(
            bodyfulQueryEndpoint(
                TodoRoutes.search,
                200,
            )({ params: {}, body: { text: "milk" } }),
        ).rejects.toThrow(z.ZodError)
    })
})

describe("responsefulMutationEndpoint", () => {
    it("sends the body with the route's method and path", async () => {
        const { request, responsefulMutationEndpoint } = factoriesReturning(todo)

        await responsefulMutationEndpoint(
            TodoRoutes.update,
            200,
        )({
            params: { id: todo.id },
            body: { completed: true },
        })

        expect(request).toHaveBeenCalledWith({
            method: "patch",
            path: `/api/todos/${todo.id}`,
            body: { completed: true },
        })
    })

    it("validates the response against the route schema", async () => {
        const { responsefulMutationEndpoint } = factoriesReturning({ nope: true })

        await expect(
            responsefulMutationEndpoint(
                TodoRoutes.create,
                201,
            )({
                params: {},
                body: { title: "Buy milk" },
            }),
        ).rejects.toThrow(z.ZodError)
    })
})

describe("responselessMutationEndpoint", () => {
    it("issues the request without parsing a response", async () => {
        const { request, responselessMutationEndpoint } = factoriesReturning(undefined)

        await expect(
            responselessMutationEndpoint(TodoRoutes.delete)({
                params: { id: todo.id },
                body: undefined,
            }),
        ).resolves.toBeUndefined()

        expect(request).toHaveBeenCalledWith({
            method: "delete",
            path: `/api/todos/${todo.id}`,
            body: undefined,
        })
    })
})
