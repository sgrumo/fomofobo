import { HttpStatus } from "models"
import { describe, expect, it, vi } from "vitest"

import { clientTransport } from "./client-transport"
import { ApiTransportError } from "./transport-error"

/**
 * @description Replaces `fetch` with a stub answering one response
 * @param response Response the stub answers with
 */
const stubFetch = (response: Response) => {
    const fetchStub = vi.fn<typeof fetch>().mockResolvedValue(response)
    vi.stubGlobal("fetch", fetchStub)
    return fetchStub
}

/**
 * @description Builds a JSON response carrying the body and the status
 * @param body Payload serialized into the response
 * @param status Status of the response
 */
const jsonResponse = (body: unknown, status: number): Response =>
    Response.json(body, { status })

describe("clientTransport", () => {
    it("should call the path the route carries, with no base URL", async () => {
        const fetchStub = stubFetch(jsonResponse([], HttpStatus.Ok))

        await clientTransport({ method: "get", path: "/api/todos" })

        expect(fetchStub.mock.calls[0]?.[0]).toBe("/api/todos")
    })

    it("should send the method in upper case", async () => {
        const fetchStub = stubFetch(jsonResponse([], HttpStatus.Ok))

        await clientTransport({ method: "query", path: "/api/todos/search", body: {} })

        expect(fetchStub.mock.calls[0]?.[1]?.method).toBe("QUERY")
    })

    it("should serialize the query, dropping every absent value", async () => {
        const fetchStub = stubFetch(jsonResponse([], HttpStatus.Ok))

        await clientTransport({
            method: "get",
            path: "/api/todos",
            query: { page: 2, completed: undefined },
        })

        expect(fetchStub.mock.calls[0]?.[0]).toBe("/api/todos?page=2")
    })

    it("should repeat the key of a list value", async () => {
        const fetchStub = stubFetch(jsonResponse([], HttpStatus.Ok))

        await clientTransport({
            method: "get",
            path: "/api/todos",
            query: { id: [1, 2] },
        })

        expect(fetchStub.mock.calls[0]?.[0]).toBe("/api/todos?id=1&id=2")
    })

    it("should send no body and no content type on a bodyless call", async () => {
        const fetchStub = stubFetch(jsonResponse([], HttpStatus.Ok))

        await clientTransport({ method: "get", path: "/api/todos" })

        expect(fetchStub.mock.calls[0]?.[1]?.body).toBeUndefined()
        expect(fetchStub.mock.calls[0]?.[1]?.headers).toBeUndefined()
    })

    it("should return the parsed body", async () => {
        stubFetch(jsonResponse({ id: "1" }, HttpStatus.Ok))

        await expect(
            clientTransport({ method: "get", path: "/api/todos/1" }),
        ).resolves.toStrictEqual({ id: "1" })
    })

    it("should throw a transport error carrying the API message", async () => {
        stubFetch(
            jsonResponse(
                {
                    code: "ItemNotFound",
                    message: "Todo with id 1 not found",
                    status: HttpStatus.NotFound,
                },
                HttpStatus.NotFound,
            ),
        )

        await expect(
            clientTransport({ method: "get", path: "/api/todos/1" }),
        ).rejects.toThrow("Todo with id 1 not found")
    })

    it("should throw a transport error when the body is not JSON", async () => {
        stubFetch(new Response("<html>gateway</html>", { status: 502 }))

        const call = clientTransport({ method: "get", path: "/api/todos" })

        await expect(call).rejects.toBeInstanceOf(ApiTransportError)
        await expect(call).rejects.toThrow("status 502")
    })

    it("should return undefined for a response with no body", async () => {
        stubFetch(new Response(null, { status: HttpStatus.NoContent }))

        await expect(
            clientTransport({ method: "delete", path: "/api/todos/1" }),
        ).resolves.toBeUndefined()
    })
})
