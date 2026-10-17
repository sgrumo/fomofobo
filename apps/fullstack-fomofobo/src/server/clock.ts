import "server-only"
import { z } from "@hono/zod-openapi"
import { createMiddleware } from "hono/factory"

import { appError } from "./errors"

export interface ClockEnv {
    Variables: { now: Date }
}

export const TEST_NOW_HEADER = "x-test-now"

const testNowSchema = z.iso.datetime({ offset: true }).transform(value => new Date(value))

/**
 * @description Builds the middleware that sets the instant every handler of the request reads as now
 * @param testClockEnabled True when the `x-test-now` header sets the instant, for the E2E suite
 */
export const requestClock = (testClockEnabled: boolean) =>
    createMiddleware<ClockEnv>(async (c, next) => {
        const header = testClockEnabled ? c.req.header(TEST_NOW_HEADER) : undefined
        const testNow = header === undefined ? undefined : testNowSchema.safeParse(header)
        if (testNow?.success === false) {
            throw appError("InvalidRequest", `${TEST_NOW_HEADER} must be an ISO instant`)
        }

        c.set("now", testNow?.data ?? new Date())
        await next()
    })
