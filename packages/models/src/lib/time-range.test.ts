import { z } from "@hono/zod-openapi"
import { describe, expect, it } from "vitest"

import { localDateSchema, localDateTimeSchema } from "./local-time"
import { withDateRange, withTimeRange } from "./time-range"

const timeRangeSchema = withTimeRange(
    z.object({ startsAt: localDateTimeSchema, endsAt: localDateTimeSchema }),
)
const dateRangeSchema = withDateRange(
    z.object({ from: localDateSchema, to: localDateSchema }),
)

describe("withTimeRange", () => {
    it("accepts an end on the next day", () => {
        expect(
            timeRangeSchema.safeParse({
                startsAt: "2026-10-14T21:00",
                endsAt: "2026-10-15T00:30",
            }).success,
        ).toBe(true)
    })

    it("rejects an end before the start", () => {
        const result = timeRangeSchema.safeParse({
            startsAt: "2026-10-14T21:00",
            endsAt: "2026-10-14T20:00",
        })

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "end-before-start" } },
        ])
    })

    it("rejects a span past the duration cap", () => {
        const result = timeRangeSchema.safeParse({
            startsAt: "2026-10-14T21:00",
            endsAt: "2026-10-16T21:00",
        })

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "duration-too-long" } },
        ])
    })

    it("rejects a value with an offset", () => {
        expect(
            timeRangeSchema.safeParse({
                startsAt: "2026-10-14T21:00Z",
                endsAt: "2026-10-14T22:00",
            }).success,
        ).toBe(false)
    })
})

describe("withDateRange", () => {
    it("accepts a one-day range", () => {
        expect(
            dateRangeSchema.safeParse({ from: "2026-10-14", to: "2026-10-14" }).success,
        ).toBe(true)
    })

    it("rejects a range that ends before it starts", () => {
        const result = dateRangeSchema.safeParse({ from: "2026-10-14", to: "2026-10-13" })

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "end-before-start" } },
        ])
    })
})
