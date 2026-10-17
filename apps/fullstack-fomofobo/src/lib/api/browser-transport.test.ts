import { HttpStatus } from "models"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ApiActionResult } from "./api-action-result"

const clientTransport = vi.fn<() => Promise<string>>()
const apiAction = vi.fn<() => Promise<ApiActionResult>>()
const redirectToLogin = vi.fn<(reason?: "blocked") => void>()

vi.mock(import("./client-transport"), () => ({ clientTransport }))
vi.mock(import("@/actions/api-action"), () => ({ apiAction }))
vi.mock(import("./login-redirect"), () => ({ redirectToLogin }))

const { browserTransport } = await import("./browser-transport")
const { ApiTransportError } = await import("./transport-error")

describe("browserTransport", () => {
    beforeEach(() => {
        clientTransport.mockReset().mockResolvedValue("http")
        apiAction.mockReset().mockResolvedValue({ outcome: "ok", data: "action" })
        redirectToLogin.mockReset()
    })

    it("should send a plain read over HTTP", async () => {
        await expect(
            browserTransport({ method: "get", path: "/api/todos" }),
        ).resolves.toBe("http")
    })

    it("should send a QUERY read through the action, because Next rejects that method", async () => {
        await expect(
            browserTransport({ method: "query", path: "/api/todos/search", body: {} }),
        ).resolves.toBe("action")
    })

    it("should send every change through the action", async () => {
        const changes = ["post", "put", "patch", "delete"] as const

        const results = await Promise.all(
            changes.map(method => browserTransport({ method, path: "/api/todos" })),
        )

        expect(results).toStrictEqual(["action", "action", "action", "action"])
        expect(clientTransport).not.toHaveBeenCalled()
    })

    it("should raise the failure an action reports as data", async () => {
        apiAction.mockResolvedValue({
            outcome: "error",
            status: HttpStatus.Conflict,
            apiError: {
                code: "TodoAlreadyExists",
                message: "Todo already exists",
                status: HttpStatus.Conflict,
            },
            message: "Todo already exists",
        })

        const call = browserTransport({ method: "post", path: "/api/todos", body: {} })

        await expect(call).rejects.toBeInstanceOf(ApiTransportError)
        await expect(call).rejects.toThrow("Todo already exists")
    })

    it("should keep the status of a failed action, so the toast can read it", async () => {
        apiAction.mockResolvedValue({
            outcome: "error",
            status: HttpStatus.BadRequest,
            apiError: undefined,
            message: "nope",
        })

        await expect(
            browserTransport({ method: "post", path: "/api/todos", body: {} }),
        ).rejects.toMatchObject({ status: HttpStatus.BadRequest })
    })

    describe("on a 401 of the API", () => {
        /**
         * @description Makes the next HTTP read fail with the status
         * @param status Status the API answers with
         */
        const failWith = (status: number): void => {
            clientTransport.mockRejectedValueOnce(
                new ApiTransportError("nope", { status }),
            )
        }

        it("should send the browser to the login page, with no retry", async () => {
            failWith(HttpStatus.Unauthorized)

            await expect(
                browserTransport({ method: "get", path: "/api/todos" }),
            ).rejects.toBeInstanceOf(ApiTransportError)

            expect(redirectToLogin).toHaveBeenCalledExactlyOnceWith(undefined)
            expect(clientTransport).toHaveBeenCalledOnce()
        })

        it("should tell the login page that the account is blocked", async () => {
            clientTransport.mockRejectedValueOnce(
                new ApiTransportError("blocked", {
                    status: HttpStatus.Unauthorized,
                    apiError: {
                        code: "AccountBlocked",
                        message: "blocked",
                        status: HttpStatus.Unauthorized,
                    },
                }),
            )

            await expect(
                browserTransport({ method: "get", path: "/api/backoffice/me" }),
            ).rejects.toBeInstanceOf(ApiTransportError)

            expect(redirectToLogin).toHaveBeenCalledExactlyOnceWith("blocked")
        })

        it("should send the browser to the login page on an action that the API refused too", async () => {
            apiAction.mockResolvedValueOnce({
                outcome: "error",
                status: HttpStatus.Unauthorized,
                apiError: undefined,
                message: "nope",
            })

            await expect(
                browserTransport({ method: "post", path: "/api/todos", body: {} }),
            ).rejects.toBeInstanceOf(ApiTransportError)

            expect(redirectToLogin).toHaveBeenCalledOnce()
        })

        it("should leave every other failure alone", async () => {
            failWith(HttpStatus.Conflict)

            await expect(
                browserTransport({ method: "get", path: "/api/todos" }),
            ).rejects.toBeInstanceOf(ApiTransportError)

            expect(redirectToLogin).not.toHaveBeenCalled()
        })
    })
})
