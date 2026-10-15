import { z } from "zod"
import type {
    $ZodInvalidTypeExpected,
    $ZodIssueTooSmall,
    $ZodStringFormats,
} from "zod/v4/core"

import type { Literals } from "./types"

export const codecs = {
    stringToNumber: z.codec(z.string().regex(z.regexes.number), z.number(), {
        decode: Number,
        encode: number => number.toString(),
    }),
    stringToInt: z.codec(z.string().regex(z.regexes.integer), z.int(), {
        decode: Number,
        encode: int => int.toString(),
    }),
}

export const zodInvalidTypeExpectedSchema: z.ZodEnum<
    Record<Literals<$ZodInvalidTypeExpected>, Literals<$ZodInvalidTypeExpected>>
> = z.enum([
    "string",
    "number",
    "int",
    "boolean",
    "bigint",
    "symbol",
    "undefined",
    "null",
    "never",
    "void",
    "date",
    "array",
    "object",
    "tuple",
    "record",
    "map",
    "set",
    "file",
    "nonoptional",
    "nan",
    "function",
] as const satisfies ReadonlyArray<Literals<$ZodInvalidTypeExpected>>)
export type ZodInvalidTypeExpected = z.infer<typeof zodInvalidTypeExpectedSchema>

export const zodLengthOriginValues = ["string", "array", "set", "map", "file"] as const
export const zodLengthOriginSchema = z.enum(zodLengthOriginValues)
export type ZodLengthOrigin = z.infer<typeof zodLengthOriginSchema>

export const zodNumericOriginValues = ["number", "int", "bigint", "date"] as const
export const zodNumericOriginSchema = z.enum(zodNumericOriginValues)
export type ZodNumericOrigin = z.infer<typeof zodNumericOriginSchema>
/**
 * @remarks Carries `map`, which Zod raises for a map size issue but leaves out of the declared origins
 */
export const zodSizeOriginSchema: z.ZodEnum<
    Record<Literals<$ZodIssueTooSmall["origin"]>, ZodLengthOrigin | ZodNumericOrigin>
> = z.enum([...zodLengthOriginValues, ...zodNumericOriginValues])
export type ZodSizeOrigin = z.infer<typeof zodSizeOriginSchema>

/**
 * @remarks Repeats the literals of `$ZodStringFormats`, which Zod declares as a type alone, and
 * fails the build when a Zod release adds or drops one
 */
export const zodStringFormatSchema: z.ZodEnum<
    Record<$ZodStringFormats, $ZodStringFormats>
> = z.enum([
    "email",
    "url",
    "emoji",
    "uuid",
    "guid",
    "nanoid",
    "cuid",
    "cuid2",
    "ulid",
    "xid",
    "ksuid",
    "datetime",
    "date",
    "time",
    "duration",
    "ipv4",
    "ipv6",
    "cidrv4",
    "cidrv6",
    "base64",
    "base64url",
    "json_string",
    "e164",
    "credit_card",
    "iban",
    "lowercase",
    "uppercase",
    "regex",
    "jwt",
    "starts_with",
    "ends_with",
    "includes",
] as const satisfies readonly $ZodStringFormats[])
export type ZodStringFormat = z.infer<typeof zodStringFormatSchema>
