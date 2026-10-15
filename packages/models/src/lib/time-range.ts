import type { z } from "@hono/zod-openapi"

import { customErrorParamsSchema } from "./custom-errors"
import { MAX_EVENT_DURATION_HOURS } from "./limits"

const MS_PER_HOUR = 3_600_000

/**
 * @description Builds a schema rejecting an end that is not after its start, or a span past the duration cap
 * @template T Object schema holding `startsAt` and `endsAt` local date-times
 * @param schema Object schema the rules attach to
 * @remarks Reads both values as wall-clock times, so a span across a daylight saving
 * change counts one hour more or less than the elapsed time
 */
export const withTimeRange = <
    T extends z.ZodObject<{ startsAt: z.ZodType<string>; endsAt: z.ZodType<string> }>,
>(
    schema: T,
): T =>
    schema
        .refine(range => range.endsAt > range.startsAt, {
            path: ["endsAt"],
            params: customErrorParamsSchema.encode({
                errorCode: "end-before-start",
                message: "must be after the start",
            }),
        })
        .refine(
            range =>
                Date.parse(`${range.endsAt}Z`) - Date.parse(`${range.startsAt}Z`) <=
                MAX_EVENT_DURATION_HOURS * MS_PER_HOUR,
            {
                path: ["endsAt"],
                params: customErrorParamsSchema.encode({
                    errorCode: "duration-too-long",
                    message: `must be at most ${String(MAX_EVENT_DURATION_HOURS)} hours after the start`,
                }),
            },
        )

/**
 * @description Builds a schema rejecting a `to` date before its `from` date
 * @template T Object schema holding `from` and `to` local dates
 * @param schema Object schema the rule attaches to
 */
export const withDateRange = <
    T extends z.ZodObject<{ from: z.ZodType<string>; to: z.ZodType<string> }>,
>(
    schema: T,
): T =>
    schema.refine(range => range.to >= range.from, {
        path: ["to"],
        params: customErrorParamsSchema.encode({
            errorCode: "end-before-start",
            message: "must be on or after the start",
        }),
    })
