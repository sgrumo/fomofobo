import { z } from "@hono/zod-openapi"

import { customErrorParamsSchema } from "./lib/custom-errors"
import { MAX_REDUCED_PRICES } from "./lib/limits"

export const euroCentsSchema = z.int().min(0).max(10_000_000)

export const reducedPriceSchema = z.object({
    label: z.string().trim().min(1).max(40),
    amountCents: euroCentsSchema,
})
export type ReducedPrice = z.infer<typeof reducedPriceSchema>

export const membershipSchema = z.object({
    name: z.string().trim().min(1).max(60),
    costCents: euroCentsSchema.nullable(),
})
export type Membership = z.infer<typeof membershipSchema>

export const priceSchemeSchema = z
    .object({
        isFree: z.boolean(),
        fullPriceCents: euroCentsSchema.nullable(),
        reducedPrices: z.array(reducedPriceSchema).max(MAX_REDUCED_PRICES),
        membership: membershipSchema.nullable(),
        minimumAge: z.int().min(1).max(21).nullable(),
        notes: z.string().trim().min(1).max(140).nullable(),
    })
    .refine(
        scheme =>
            !scheme.isFree ||
            (scheme.fullPriceCents === null && scheme.reducedPrices.length === 0),
        {
            path: ["fullPriceCents"],
            params: customErrorParamsSchema.encode({
                errorCode: "free-with-price",
                message: "a free event takes no price",
            }),
        },
    )
    .refine(
        scheme =>
            scheme.isFree ||
            scheme.fullPriceCents !== null ||
            scheme.reducedPrices.length > 0 ||
            scheme.notes !== null,
        {
            path: ["fullPriceCents"],
            params: customErrorParamsSchema.encode({
                errorCode: "paid-without-price",
                message: "must give a price, a reduced price or a note",
            }),
        },
    )
export type PriceScheme = z.infer<typeof priceSchemeSchema>
