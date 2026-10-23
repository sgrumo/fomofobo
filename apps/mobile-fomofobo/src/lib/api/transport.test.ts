import { describe, expect, it, vi } from "vitest"

import { createApiRequest } from "./transport"

const request = createApiRequest("https://api.test")

/**
 * @description Builds a `fetch` mock resolving the status and body
 * @param status Status of the stubbed response
 * @param body Body of the stubbed response
 * @remarks Replaces the global `fetch` for the rest of the test
 */
const respondWith = (status: number, body: string | null) => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(() =>
        Promise.resolve(new Response(body, { status })),
    )
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
}

/**
 * @description Returns the URL of the first `fetch` call
 * @param fetchMock Mock built by `respondWith`
 */
const requestedUrl = (fetchMock: ReturnType<typeof respondWith>) =>
    fetchMock.mock.calls[0]?.[0]

/**
 * @description Returns the headers of the first `fetch` call
 * @param fetchMock Mock built by `respondWith`
 */
const requestedHeaders = (fetchMock: ReturnType<typeof respondWith>) =>
    fetchMock.mock.calls[0]?.[1]?.headers

describe("createApiRequest", () => {
    it("resolves to undefined on an empty 204 body", async () => {
        respondWith(204, null)

        await expect(
            request({ method: "delete", path: "/api/todos/1" }),
        ).resolves.toBeUndefined()
    })

    it("returns the parsed json body", async () => {
        respondWith(200, JSON.stringify([{ title: "Buy milk" }]))

        await expect(
            request({ method: "get", path: "/api/todos" }),
        ).resolves.toStrictEqual([{ title: "Buy milk" }])
    })

    it("surfaces the server's api error message", async () => {
        respondWith(
            404,
            JSON.stringify({ code: "NOT_FOUND", message: "Todo not found", status: 404 }),
        )

        await expect(request({ method: "get", path: "/api/todos/1" })).rejects.toThrow(
            "GET /api/todos/1 failed (404): Todo not found",
        )
    })

    it("still reports the status when the error body is not json", async () => {
        respondWith(502, "<html>bad gateway</html>")

        await expect(request({ method: "get", path: "/api/todos" })).rejects.toThrow(
            "GET /api/todos failed (502)",
        )
    })

    it("repeats a key for each item of an array query value", async () => {
        const fetchMock = respondWith(200, "[]")

        await request({ method: "get", path: "/api/todos", query: { tag: ["a", "b"] } })

        expect(requestedUrl(fetchMock)).toBe("https://api.test/api/todos?tag=a&tag=b")
    })

    it("omits undefined query values", async () => {
        const fetchMock = respondWith(200, "[]")

        await request({
            method: "get",
            path: "/api/todos",
            query: { page: 2, completed: undefined },
        })

        expect(requestedUrl(fetchMock)).toBe("https://api.test/api/todos?page=2")
    })

    it("adds the client headers to every request", async () => {
        const fetchMock = respondWith(200, "[]")
        const requestWithClient = createApiRequest("https://api.test", {
            "x-app-platform": "ios",
            "x-app-version": "1.5.0",
        })

        await requestWithClient({ method: "get", path: "/api/todos" })

        expect(requestedHeaders(fetchMock)).toStrictEqual({
            "Content-Type": "application/json",
            "x-app-platform": "ios",
            "x-app-version": "1.5.0",
        })
    })

    it("sends the content type alone when no client header is given", async () => {
        const fetchMock = respondWith(200, "[]")

        await request({ method: "get", path: "/api/todos" })

        expect(requestedHeaders(fetchMock)).toStrictEqual({
            "Content-Type": "application/json",
        })
    })

    it("sends no query string when there is nothing to send", async () => {
        const fetchMock = respondWith(200, "[]")

        await request({ method: "get", path: "/api/todos", query: {} })

        expect(requestedUrl(fetchMock)).toBe("https://api.test/api/todos")
    })
})
