import { z } from "@hono/zod-openapi"
import { weekDays } from "shared/temporal"

import { customErrorParamsSchema } from "./lib/custom-errors"
import { localDateSchema } from "./lib/local-time"

// PLACEHOLDER(OP-15)
const weeklyRuleSchema = z.object({
    frequency: z.literal("weekly"),
    weekdays: z.array(z.enum(weekDays)).min(1),
    until: localDateSchema,
})

// PLACEHOLDER(OP-15)
const monthlyRuleSchema = z.object({
    frequency: z.literal("monthly"),
    mode: z.enum(["day-of-month", "weekday-position"]),
    until: localDateSchema,
})

export const recurrenceRuleSchema = z.discriminatedUnion("frequency", [
    weeklyRuleSchema,
    monthlyRuleSchema,
])
export type RecurrenceRule = z.infer<typeof recurrenceRuleSchema>

export const recurrenceSchema = z
    .object({
        rule: recurrenceRuleSchema,
        addedDates: z.array(localDateSchema),
        removedDates: z.array(localDateSchema),
    })
    .refine(
        recurrence =>
            new Set(recurrence.addedDates).size === recurrence.addedDates.length &&
            new Set(recurrence.removedDates).size === recurrence.removedDates.length,
        {
            params: customErrorParamsSchema.encode({
                errorCode: "duplicate-date",
                message: "must list each date once",
            }),
        },
    )
    .refine(
        recurrence =>
            !recurrence.addedDates.some(date => recurrence.removedDates.includes(date)),
        {
            params: customErrorParamsSchema.encode({
                errorCode: "date-added-and-removed",
                message: "must not add and remove the same date",
            }),
        },
    )
export type Recurrence = z.infer<typeof recurrenceSchema>
