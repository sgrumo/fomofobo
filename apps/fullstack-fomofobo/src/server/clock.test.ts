import { z } from "@hono/zod-openapi"
import { Hono } from "hono"
import { describe, expect, it } from "vitest"

import type { ClockEnv } from "./clock"
import { requestClock, TEST_NOW_HEADER } from "./clock"

/**
 * @description Builds an app that answers the instant the clock sets
 * @param testClockEnabled True when the header sets the instant
 */
const buildApp = (testClockEnabled: boolean) =>
    new Hono<ClockEnv>()
        .use(requestClock(testClockEnabled))
        .get("/now", c => c.json({ now: c.var.now.toISOString() }))
        .onError((_error, c) => c.json({ failed: true }, 400))

describe("requestClock", () => {
    it("should set the instant of the header when the test clock is on", async () => {
        const response = await buildApp(true).request("/now", {
            headers: { [TEST_NOW_HEADER]: "2026-10-24T19:00:00+02:00" },
        })

        expect(await response.json()).toStrictEqual({ now: "2026-10-24T17:00:00.000Z" })
    })

    it("should ignore the header when the test clock is off", async () => {
        const before = Date.now()
        const response = await buildApp(false).request("/now", {
            headers: { [TEST_NOW_HEADER]: "2000-01-01T00:00:00Z" },
        })
        const { now } = z.object({ now: z.iso.datetime() }).parse(await response.json())

        expect(Date.parse(now)).toBeGreaterThanOrEqual(before)
    })

    it("should refuse a header that is not an ISO instant", async () => {
        const response = await buildApp(true).request("/now", {
            headers: { [TEST_NOW_HEADER]: "tomorrow" },
        })

        expect(response.status).toBe(400)
    })
})
