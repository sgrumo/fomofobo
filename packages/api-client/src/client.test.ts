import { createRoute, z } from "@hono/zod-openapi"
import { paginatedResponseSchema, paginationQuerySchema } from "models"
import { describe, expect, it, vi } from "vitest"

import type { ApiRequest } from "./client"
import { createEndpointFactories } from "./client"

const itemSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    done: z.boolean(),
})

const itemBodySchema = z.object({
    title: z.string().min(1).optional(),
    done: z.boolean().optional(),
})

const itemSearchSchema = z.object({
    text: z.string().min(1).optional(),
    ids: z.array(z.uuid()).min(1).optional(),
})

const itemParamsSchema = z.object({ id: z.uuid() })

const jsonBody = <TSchema extends z.ZodType>(schema: TSchema) => ({
    required: true,
    content: { "application/json": { schema } },
})

const jsonResponse = <TSchema extends z.ZodType>(schema: TSchema) => ({
    content: { "application/json": { schema } },
    description: "Fixture response",
})

const itemRoutes = {
    create: createRoute({
        method: "post",
        path: "/api/items",
        request: { body: jsonBody(itemBodySchema) },
        responses: { 201: jsonResponse(itemSchema) },
    }),
    getList: createRoute({
        method: "get",
        path: "/api/items",
        responses: { 200: jsonResponse(z.array(itemSchema)) },
    }),
    listPaginated: createRoute({
        method: "get",
        path: "/api/items/paginated",
        request: {
            query: paginationQuerySchema.extend({ done: z.stringbool().optional() }),
        },
        responses: { 200: jsonResponse(paginatedResponseSchema(itemSchema)) },
    }),
    search: createRoute({
        method: "query",
        path: "/api/items/search",
        request: { body: jsonBody(itemSearchSchema) },
        responses: { 200: jsonResponse(z.array(itemSchema)) },
    }),
    getById: createRoute({
        method: "get",
        path: "/api/items/{id}",
        request: { params: itemParamsSchema },
        responses: { 200: jsonResponse(itemSchema) },
    }),
    update: createRoute({
        method: "patch",
        path: "/api/items/{id}",
        request: { params: itemParamsSchema, body: jsonBody(itemBodySchema) },
        responses: { 200: jsonResponse(itemSchema) },
    }),
    delete: createRoute({
        method: "delete",
        path: "/api/items/{id}",
        request: { params: itemParamsSchema },
        responses: { 204: { description: "Fixture deleted" } },
    }),
}

const item = {
    id: "3f1a6d2e-9b7c-4c1f-8a2d-5e6f7a8b9c0d",
    title: "Buy milk",
    done: false,
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
        const { request, bodylessQueryEndpoint } = factoriesReturning(item)

        await bodylessQueryEndpoint(
            itemRoutes.getById,
            200,
        )({
            params: { id: item.id },
            query: {},
        })

        expect(request).toHaveBeenCalledWith({
            method: "get",
            path: `/api/items/${item.id}`,
            query: {},
        })
    })

    it("percent-encodes path params", async () => {
        const { request, bodylessQueryEndpoint } = factoriesReturning(item)

        await bodylessQueryEndpoint(
            itemRoutes.getById,
            200,
        )({
            params: { id: "a/b?c" },
            query: {},
        })

        expect(request.mock.calls[0]?.[0].path).toBe("/api/items/a%2Fb%3Fc")
    })

    it("passes pagination query values through", async () => {
        const { request, bodylessQueryEndpoint } = factoriesReturning({
            items: [item],
            total: 1,
            page: 2,
            pageSize: 5,
            totalPages: 1,
        })

        await bodylessQueryEndpoint(
            itemRoutes.listPaginated,
            200,
        )({
            params: {},
            query: { page: 2, pageSize: 5, done: undefined },
        })

        expect(request.mock.calls[0]?.[0].query).toStrictEqual({
            page: 2,
            pageSize: 5,
            done: undefined,
        })
    })

    it("validates the response against the route schema", async () => {
        const { bodylessQueryEndpoint } = factoriesReturning({ id: item.id, title: 42 })

        await expect(
            bodylessQueryEndpoint(
                itemRoutes.getById,
                200,
            )({ params: { id: item.id }, query: {} }),
        ).rejects.toThrow(z.ZodError)
    })

    it("returns the parsed response", async () => {
        const { bodylessQueryEndpoint } = factoriesReturning([item])

        await expect(
            bodylessQueryEndpoint(itemRoutes.getList, 200)({ params: {}, query: {} }),
        ).resolves.toStrictEqual([item])
    })
})

describe("bodyfulQueryEndpoint", () => {
    it("sends the criteria body with the route's method and path", async () => {
        const { request, bodyfulQueryEndpoint } = factoriesReturning([item])

        await bodyfulQueryEndpoint(
            itemRoutes.search,
            200,
        )({
            params: {},
            body: { text: "milk", ids: [item.id] },
        })

        expect(request).toHaveBeenCalledWith({
            method: "query",
            path: "/api/items/search",
            body: { text: "milk", ids: [item.id] },
        })
    })

    it("omits the criteria the caller leaves out", async () => {
        const { request, bodyfulQueryEndpoint } = factoriesReturning([])

        await bodyfulQueryEndpoint(itemRoutes.search, 200)({ params: {}, body: {} })

        expect(request.mock.calls[0]?.[0].body).toStrictEqual({})
    })

    it("validates the response against the route schema", async () => {
        const { bodyfulQueryEndpoint } = factoriesReturning([{ id: item.id, title: 42 }])

        await expect(
            bodyfulQueryEndpoint(
                itemRoutes.search,
                200,
            )({ params: {}, body: { text: "milk" } }),
        ).rejects.toThrow(z.ZodError)
    })
})

describe("responsefulMutationEndpoint", () => {
    it("sends the body with the route's method and path", async () => {
        const { request, responsefulMutationEndpoint } = factoriesReturning(item)

        await responsefulMutationEndpoint(
            itemRoutes.update,
            200,
        )({
            params: { id: item.id },
            body: { done: true },
        })

        expect(request).toHaveBeenCalledWith({
            method: "patch",
            path: `/api/items/${item.id}`,
            body: { done: true },
        })
    })

    it("validates the response against the route schema", async () => {
        const { responsefulMutationEndpoint } = factoriesReturning({ nope: true })

        await expect(
            responsefulMutationEndpoint(
                itemRoutes.create,
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
            responselessMutationEndpoint(itemRoutes.delete)({
                params: { id: item.id },
                body: undefined,
            }),
        ).resolves.toBeUndefined()

        expect(request).toHaveBeenCalledWith({
            method: "delete",
            path: `/api/items/${item.id}`,
            body: undefined,
        })
    })
})
