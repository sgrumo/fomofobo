import type {
    FormErrorKey,
    FormErrorParams,
    FormErrorTranslator,
    FormIssueKey,
} from "frontend-shared/types"
import { customErrorParamsSchema } from "models"
import { isDefined } from "shared/values"
import {
    zodInvalidTypeExpectedSchema,
    zodLengthOriginValues,
    zodNumericOriginValues,
    zodSizeOriginSchema,
    zodStringFormatSchema,
} from "shared/zod"
import { match, P } from "ts-pattern"
import type { z } from "zod"
import type { $ZodRawIssue } from "zod/v4/core"

/**
 * @description Returns the bound variant leaf of a size issue
 * @param issue Size issue read
 */
const boundVariant = (issue: {
    inclusive?: boolean
    exact?: boolean
}): "Exact" | "Exclusive" | "Inclusive" =>
    match(issue)
        .returnType<"Exact" | "Exclusive" | "Inclusive">()
        .with({ exact: true }, () => "Exact")
        .with({ inclusive: false }, () => "Exclusive")
        .with(
            { exact: P.optional(false), inclusive: P.optional(true) },
            () => "Inclusive",
        )
        .exhaustive()

/**
 * @description Returns the keys of a size issue, the origin-specific one first
 * @param group Key group of the issue code
 * @param issue Size issue read
 * @remarks Yields the `Default` key alone for an origin outside the Zod enumerations
 */
const sizeKeys = (
    group: "TooSmall" | "TooBig",
    issue: { origin: string; inclusive?: boolean; exact?: boolean },
): FormErrorKey[] => {
    const defaultKey: FormErrorKey = `FormErrors.${group}.Default`
    const origin = zodSizeOriginSchema.safeParse(issue.origin)
    const specificKey = match({
        origin: origin.success ? origin.data : undefined,
        bound: boundVariant(issue),
    })
        .returnType<FormErrorKey | undefined>()
        .with(
            {
                origin: P.union(...zodLengthOriginValues),
                bound: P.union("Inclusive", "Exact"),
            },
            size => `FormErrors.${group}.${size.origin}.${size.bound}`,
        )
        .with(
            {
                origin: P.union(...zodNumericOriginValues),
                bound: P.union("Inclusive", "Exclusive"),
            },
            size => `FormErrors.${group}.${size.origin}.${size.bound}`,
        )
        .with(
            P.union(
                { origin: undefined },
                { origin: P.union(...zodLengthOriginValues), bound: "Exclusive" },
                { origin: P.union(...zodNumericOriginValues), bound: "Exact" },
            ),
            () => undefined,
        )
        .exhaustive()
    return [specificKey, defaultKey].filter(isDefined)
}

/**
 * @description Returns the `ui` namespace key candidates of a Zod issue, most specific first
 * @param issue Issue raised by the parse
 * @remarks Returns an empty list for a code with no form wording, or a custom issue outside `customErrorParamsSchema`, so the caller falls through to the Zod locale
 */
export const formIssueKeys = (issue: $ZodRawIssue): FormIssueKey[] =>
    match(issue)
        .returnType<FormIssueKey[]>()
        .with({ code: "invalid_type", input: undefined }, () => ["FormErrors.Required"])
        .with({ code: "invalid_type" }, iss => {
            const expected = zodInvalidTypeExpectedSchema.safeParse(iss.expected)
            return expected.success
                ? [
                      `FormErrors.InvalidType.${expected.data}`,
                      "FormErrors.InvalidType.Default",
                  ]
                : ["FormErrors.InvalidType.Default"]
        })
        .with({ code: "too_small", origin: "string", minimum: 1 }, () => [
            "FormErrors.Required",
        ])
        .with({ code: "too_small" }, iss => sizeKeys("TooSmall", iss))
        .with({ code: "too_big" }, iss => sizeKeys("TooBig", iss))
        .with({ code: "invalid_format" }, iss => {
            const format = zodStringFormatSchema.safeParse(iss.format)
            return format.success
                ? [
                      `FormErrors.InvalidFormat.${format.data}`,
                      "FormErrors.InvalidFormat.Default",
                  ]
                : ["FormErrors.InvalidFormat.Default"]
        })
        .with({ code: "invalid_value" }, () => ["FormErrors.InvalidValue"])
        .with({ code: "not_multiple_of" }, () => ["FormErrors.NotMultipleOf"])
        .with({ code: "unrecognized_keys" }, () => ["FormErrors.UnrecognizedKeys"])
        .with({ code: "custom" }, iss => {
            const params = customErrorParamsSchema.safeParse(iss.params)
            return params.success ? [`FormErrors.Custom.${params.data.errorCode}`] : []
        })
        .with(
            { code: P.union("invalid_union", "invalid_key", "invalid_element") },
            () => [],
        )
        .exhaustive()

/**
 * @description Returns the interpolation values of a Zod issue
 * @param issue Issue raised by the parse
 * @remarks Never includes the input, so no user data reaches the message
 */
const formIssueParams = (issue: $ZodRawIssue): FormErrorParams =>
    match(issue)
        .returnType<FormErrorParams>()
        .with({ code: "invalid_type" }, iss => ({ expected: iss.expected }))
        .with({ code: "too_small" }, iss => ({
            origin: iss.origin,
            minimum: Number(iss.minimum),
            count: Number(iss.minimum),
        }))
        .with({ code: "too_big" }, iss => ({
            origin: iss.origin,
            maximum: Number(iss.maximum),
            count: Number(iss.maximum),
        }))
        .with({ code: "invalid_format" }, iss => ({ format: iss.format }))
        .with({ code: "invalid_value" }, iss => ({
            values: iss.values.map(String).join(", "),
        }))
        .with({ code: "not_multiple_of" }, iss => ({ divisor: iss.divisor }))
        .with({ code: "unrecognized_keys" }, iss => ({ keys: iss.keys.join(", ") }))
        .with(
            {
                code: P.union(
                    "custom",
                    "invalid_union",
                    "invalid_key",
                    "invalid_element",
                ),
            },
            () => ({}),
        )
        .exhaustive()

/**
 * @description Returns a Zod error map translating form issues through the `ui` namespace
 * @param translator Key lookup and translation over the `ui` namespace
 * @remarks Returns `undefined` for an issue with no translated key, so Zod falls through to its locale
 */
export const createFormErrorMap =
    (translator: FormErrorTranslator): z.core.$ZodErrorMap =>
    issue => {
        const params = formIssueParams(issue)
        const key = formIssueKeys(issue).find(candidate =>
            translator.exists(candidate, params),
        )
        return isDefined(key) ? translator.translate(key, params) : undefined
    }

/**
 * @description Returns a parser running a schema with the error map built from the trailing arguments
 * @template A Arguments the parser forwards to the error map builder
 * @param errorMap Builder of the error map applied to one parse
 * @remarks Returns the raw parse result, so the caller treeifies the error on its concrete form state type
 */
export const parseFormStateWith =
    <const A extends unknown[]>(errorMap: (...args: A) => z.core.$ZodErrorMap) =>
    <TOutput>(
        schema: z.ZodType<TOutput>,
        data: unknown,
        ...args: A
    ): z.ZodSafeParseResult<TOutput> =>
        schema.safeParse(data, { error: errorMap(...args) })
