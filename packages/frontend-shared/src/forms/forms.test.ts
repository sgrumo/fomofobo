import { customErrorParamsSchema } from "models"
import { describe, expect, it } from "vitest"
import { z } from "zod"

import type { FormErrorParams, FormErrorTranslator, FormIssueKey } from "../types/types"
import { createFormErrorMap, formIssueKeys, parseFormStateWith } from "./forms"

/**
 * @description Builds a translator knowing the given keys, echoing key and params as the message
 * @param known Keys the translator resolves
 */
const createTranslator = (known: FormIssueKey[]): FormErrorTranslator => ({
    exists: key => known.includes(key),
    translate: (key, params) => `${key} ${JSON.stringify(params)}`,
})

/**
 * @description Returns the error tree of a parse result, `undefined` on success
 * @template T Parsed output type
 * @param result Result read
 */
const treeOf = <T>(
    result: z.ZodSafeParseResult<T>,
): z.core.$ZodErrorTree<T> | undefined =>
    result.success ? undefined : z.treeifyError(result.error)

/**
 * @description Returns the key candidates of the first issue raised by the schema on the input
 * @param schema Schema parsed
 * @param input Input parsed
 * @remarks Reads the error tree, since Zod runs the error map on the first read of `error`
 */
const firstIssueKeys = (schema: z.ZodType, input: unknown): FormIssueKey[] => {
    const collected: FormIssueKey[][] = []
    treeOf(
        schema.safeParse(input, {
            error: issue => {
                collected.push(formIssueKeys(issue))
                return undefined
            },
        }),
    )
    return collected[0] ?? []
}

describe("formIssueKeys", () => {
    it("maps a missing value to the required key", () => {
        expect(firstIssueKeys(z.string(), undefined)).toStrictEqual([
            "FormErrors.Required",
        ])
    })

    it("maps a one-character minimum on a string to the required key", () => {
        expect(firstIssueKeys(z.string().min(1), "")).toStrictEqual([
            "FormErrors.Required",
        ])
    })

    it("maps a wrong type to the expected type key, then the default", () => {
        expect(firstIssueKeys(z.number(), "3")).toStrictEqual([
            "FormErrors.InvalidType.number",
            "FormErrors.InvalidType.Default",
        ])
    })

    it("keeps only the default for a type or origin outside the Zod enumerations", () => {
        const unknownType = z.unknown().check(ctx => {
            ctx.issues.push({
                code: "invalid_type",
                expected: "custom",
                input: ctx.value,
            })
        })
        const unknownOrigin = z.unknown().check(ctx => {
            ctx.issues.push({
                code: "too_small",
                origin: "custom",
                minimum: 1,
                input: ctx.value,
            })
        })

        expect(firstIssueKeys(unknownType, "x")).toStrictEqual([
            "FormErrors.InvalidType.Default",
        ])
        expect(firstIssueKeys(unknownOrigin, "x")).toStrictEqual([
            "FormErrors.TooSmall.Default",
        ])
    })

    it("maps numeric and counted origins to their own bound variants", () => {
        expect(firstIssueKeys(z.date().min(new Date(2)), new Date(1))).toStrictEqual([
            "FormErrors.TooSmall.date.Inclusive",
            "FormErrors.TooSmall.Default",
        ])
        expect(firstIssueKeys(z.set(z.string()).size(2), new Set(["a"]))).toStrictEqual([
            "FormErrors.TooSmall.set.Exact",
            "FormErrors.TooSmall.Default",
        ])
    })

    it("maps size issues by origin and bound variant", () => {
        expect(firstIssueKeys(z.string().min(3), "ab")).toStrictEqual([
            "FormErrors.TooSmall.string.Inclusive",
            "FormErrors.TooSmall.Default",
        ])
        expect(firstIssueKeys(z.string().length(3), "ab")).toStrictEqual([
            "FormErrors.TooSmall.string.Exact",
            "FormErrors.TooSmall.Default",
        ])
        expect(firstIssueKeys(z.number().gt(3), 3)).toStrictEqual([
            "FormErrors.TooSmall.number.Exclusive",
            "FormErrors.TooSmall.Default",
        ])
        expect(firstIssueKeys(z.array(z.string()).max(1), ["a", "b"])).toStrictEqual([
            "FormErrors.TooBig.array.Inclusive",
            "FormErrors.TooBig.Default",
        ])
    })

    it("maps a format issue to the format key, then the default", () => {
        expect(firstIssueKeys(z.email(), "nope")).toStrictEqual([
            "FormErrors.InvalidFormat.email",
            "FormErrors.InvalidFormat.Default",
        ])
    })

    it("maps enum, multiple, and unknown key issues to flat keys", () => {
        expect(firstIssueKeys(z.enum(["a", "b"]), "c")).toStrictEqual([
            "FormErrors.InvalidValue",
        ])
        expect(firstIssueKeys(z.number().multipleOf(2), 3)).toStrictEqual([
            "FormErrors.NotMultipleOf",
        ])
        expect(firstIssueKeys(z.strictObject({}), { extra: 1 })).toStrictEqual([
            "FormErrors.UnrecognizedKeys",
        ])
    })

    it("reads the key of a custom issue from its encoded params", () => {
        const schema = z.string().refine(() => false, {
            params: customErrorParamsSchema.encode({
                errorCode: "not-semver",
                message: "must be a semver version",
            }),
        })
        expect(firstIssueKeys(schema, "x")).toStrictEqual([
            "FormErrors.Custom.not-semver",
        ])
    })

    it("yields no key for a custom issue outside the custom error params", () => {
        expect(
            firstIssueKeys(
                z.string().refine(() => false),
                "x",
            ),
        ).toStrictEqual([])
        expect(
            firstIssueKeys(
                z.string().refine(() => false, { params: { errorCode: "unknown" } }),
                "x",
            ),
        ).toStrictEqual([])
    })
})

describe("createFormErrorMap", () => {
    it("translates the most specific known key with the issue params", () => {
        const parse = parseFormStateWith(() =>
            createFormErrorMap(
                createTranslator([
                    "FormErrors.TooSmall.string.Inclusive",
                    "FormErrors.TooSmall.Default",
                ]),
            ),
        )
        const result = parse(z.object({ name: z.string().min(3) }), { name: "ab" })

        expect(result.success).toBe(false)
        const expectedParams: FormErrorParams = { origin: "string", minimum: 3, count: 3 }
        expect(treeOf(result)?.properties?.name?.errors).toStrictEqual([
            `FormErrors.TooSmall.string.Inclusive ${JSON.stringify(expectedParams)}`,
        ])
    })

    it("falls back to a less specific known key", () => {
        const parse = parseFormStateWith(() =>
            createFormErrorMap(createTranslator(["FormErrors.InvalidType.Default"])),
        )
        const result = parse(z.object({ age: z.number() }), { age: "3" })

        expect(treeOf(result)?.properties?.age?.errors).toStrictEqual([
            `FormErrors.InvalidType.Default ${JSON.stringify({ expected: "number" })}`,
        ])
    })

    it("falls through to the Zod message when no key is known", () => {
        const parse = parseFormStateWith(() => createFormErrorMap(createTranslator([])))
        const result = parse(z.object({ age: z.number() }), { age: undefined })

        expect(treeOf(result)?.properties?.age?.errors).toStrictEqual([
            "Invalid input: expected number, received undefined",
        ])
    })
})

describe("parseFormStateWith", () => {
    const parse = parseFormStateWith(() => () => "translated")
    const schema = z.object({
        title: z.string().min(1),
        nested: z.object({ count: z.number() }),
    })

    it("returns the parsed output on success", () => {
        const result = parse(schema, { title: "a", nested: { count: 1 } })

        expect(result).toStrictEqual({
            success: true,
            data: { title: "a", nested: { count: 1 } },
        })
    })

    it("returns the per-field error tree on failure", () => {
        const result = parse(schema, { title: "", nested: { count: "1" } })

        expect(result.success).toBe(false)
        expect(treeOf(result)?.properties?.title?.errors).toStrictEqual(["translated"])
        expect(
            treeOf(result)?.properties?.nested?.properties?.count?.errors,
        ).toStrictEqual(["translated"])
    })
})
