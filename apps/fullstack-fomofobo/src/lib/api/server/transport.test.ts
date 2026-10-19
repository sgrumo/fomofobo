import { HttpStatus } from "models"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiTransportError } from "../transport-error"
import { dispatchToApi } from "./transport"

const request =
    vi.fn<(input: string, init?: RequestInit) => Promise<Response> | Response>()

/**
 * @description Sends the call into the stubbed application
 * @param call Method, path, query and body of the call
 */
const serverTransport = async (
    call: Parameters<typeof dispatchToApi>[1],
    options?: Parameters<typeof dispatchToApi>[2],
) => await dispatchToApi({ request }, call, options)

/**
 * @description Returns the URL the transport dispatched
 */
const dispatchedUrl = (): URL => new URL(request.mock.calls[0]?.[0] ?? "")

describe("serverTransport", () => {
    beforeEach(() => {
        request.mockReset()
        request.mockResolvedValue(Response.json([], { status: HttpStatus.Ok }))
    })

    it("should dispatch the routing path of the route", async () => {
        await serverTransport({ method: "get", path: "/api/todos" })

        expect(dispatchedUrl().pathname).toBe("/api/todos")
    })

    it("should send the method in upper case", async () => {
        await serverTransport({ method: "query", path: "/api/todos/search", body: {} })

        expect(request.mock.calls[0]?.[1]?.method).toBe("QUERY")
    })

    it("should serialize the query, dropping every absent value", async () => {
        await serverTransport({
            method: "get",
            path: "/api/todos",
            query: { page: 2, completed: undefined },
        })

        expect(dispatchedUrl().search).toBe("?page=2")
    })

    it("should repeat the key of a list value", async () => {
        await serverTransport({
            method: "get",
            path: "/api/todos",
            query: { id: [1, 2] },
        })

        expect(dispatchedUrl().searchParams.getAll("id")).toStrictEqual(["1", "2"])
    })

    it("should send the body and its content type", async () => {
        await serverTransport({
            method: "post",
            path: "/api/todos",
            body: { title: "Buy milk" },
        })

        expect(request.mock.calls[0]?.[1]?.body).toBe('{"title":"Buy milk"}')
        expect(request.mock.calls[0]?.[1]?.headers).toStrictEqual({
            "Content-Type": "application/json",
        })
    })

    it("should send no body and no content type on a bodyless call", async () => {
        await serverTransport({ method: "get", path: "/api/todos" })

        expect(request.mock.calls[0]?.[1]?.body).toBeUndefined()
        expect(request.mock.calls[0]?.[1]?.headers).toStrictEqual({})
    })

    it("should forward the session cookies", async () => {
        await serverTransport(
            { method: "get", path: "/api/todos" },
            { cookie: "fomofobo.session_token=abc" },
        )

        expect(request.mock.calls[0]?.[1]?.headers).toStrictEqual({
            Cookie: "fomofobo.session_token=abc",
        })
    })

    it("should forward the test instant", async () => {
        await serverTransport(
            { method: "get", path: "/api/todos" },
            { testNow: "2026-10-24T12:00:00+02:00" },
        )

        expect(request.mock.calls[0]?.[1]?.headers).toStrictEqual({
            "x-test-now": "2026-10-24T12:00:00+02:00",
        })
    })

    it("should send no cookie header when the request holds none", async () => {
        await serverTransport(
            { method: "get", path: "/api/todos" },
            { cookie: undefined },
        )

        expect(request.mock.calls[0]?.[1]?.headers).toStrictEqual({})
    })

    it("should return the parsed body", async () => {
        request.mockResolvedValue(Response.json({ id: "1" }, { status: HttpStatus.Ok }))

        await expect(
            serverTransport({ method: "get", path: "/api/todos/1" }),
        ).resolves.toStrictEqual({ id: "1" })
    })

    it("should throw a transport error carrying the API message", async () => {
        request.mockResolvedValue(
            Response.json(
                {
                    code: "ItemNotFound",
                    message: "Todo with id 1 not found",
                    status: HttpStatus.NotFound,
                },
                { status: HttpStatus.NotFound },
            ),
        )

        await expect(
            serverTransport({ method: "get", path: "/api/todos/1" }),
        ).rejects.toThrow("Todo with id 1 not found")
    })

    it("should throw a transport error when the body is not JSON", async () => {
        request.mockResolvedValue(new Response("boom", { status: 502 }))

        const call = serverTransport({ method: "get", path: "/api/todos" })

        await expect(call).rejects.toBeInstanceOf(ApiTransportError)
        await expect(call).rejects.toThrow("status 502")
    })

    it("should open no socket, so it needs no base URL", async () => {
        await serverTransport({ method: "get", path: "/api/todos" })

        expect(dispatchedUrl().protocol).toBe("http:")
        expect(request).toHaveBeenCalledOnce()
    })
})
