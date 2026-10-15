import { afterEach, describe, expect, it, vi } from "vitest"

import { logger } from "./logger"

describe("logger", () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("writes one JSON line with the level, the message and the meta", () => {
        const info = vi.spyOn(console, "info").mockReturnValue(undefined)

        logger.info("request", { path: "/api/health", status: 200 })

        expect(info).toHaveBeenCalledOnce()
        expect(JSON.parse(String(info.mock.calls[0]?.[0]))).toStrictEqual({
            level: "info",
            message: "request",
            path: "/api/health",
            status: 200,
        })
    })

    it("writes through the console method of the level", () => {
        const error = vi.spyOn(console, "error").mockReturnValue(undefined)

        logger.log("error", "response", { status: 500 })

        expect(error).toHaveBeenCalledOnce()
    })

    it("writes debug entries outside production", () => {
        const debug = vi.spyOn(console, "debug").mockReturnValue(undefined)

        logger.debug("query")

        expect(JSON.parse(String(debug.mock.calls[0]?.[0]))).toStrictEqual({
            level: "debug",
            message: "query",
        })
    })
})
