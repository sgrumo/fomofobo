import { mapValues } from "es-toolkit"
import type { FormErrors, FormIssueKey, FormResult } from "frontend-shared/types"
import {
    eventUpsertSchema,
    localDateTimeSchema,
    nonEmptyUpdate,
    publicSearchQuerySchema,
    recurrenceSchema,
    semverSchema,
    withTimeRange,
} from "models"
import { Result } from "shared/result"
import { z } from "zod"
import type { $ZodRawIssue } from "zod/v4/core"

import type { FormStateParser } from "./components-showcase.helper"

//#region Types
export type FormErrorsShowcaseValue =
    | { control: "string"; value: string | undefined }
    | { control: "number"; value: number | undefined }
    | { control: "date"; value: Date | undefined }
    | { control: "readonly"; value: unknown; display: string }

export interface FormErrorsShowcaseField {
    schema: z.ZodType
    initial: FormErrorsShowcaseValue
}

export type FormErrorsShowcaseState = Record<FormIssueKey, FormErrorsShowcaseValue>
//#endregion

//#region Fields
const text = (value: string | undefined): FormErrorsShowcaseValue => ({
    control: "string",
    value,
})
const number = (value: number | undefined): FormErrorsShowcaseValue => ({
    control: "number",
    value,
})
const date = (value: Date | undefined): FormErrorsShowcaseValue => ({
    control: "date",
    value,
})
const shown = (value: unknown, display: string): FormErrorsShowcaseValue => ({
    control: "readonly",
    value,
    display,
})

/**
 * @description Returns a schema raising one raw issue on every input
 * @param issue Builder of the raised issue from the input
 * @remarks Covers the keys no built-in Zod check reaches, such as the `Default` fallbacks
 */
const raising = (issue: (input: unknown) => $ZodRawIssue): z.ZodType =>
    z.unknown().check(ctx => {
        ctx.issues.push(issue(ctx.value))
    })

const isJson = (value: string): boolean =>
    Result.try((): unknown => JSON.parse(value)).success

const pastDate = new Date("2020-01-01")
const futureDate = new Date("2030-01-01")
const sampleFile = () => new File(["a"], "sample.txt")

const timeRangeSchema = withTimeRange(
    z.object({ startsAt: localDateTimeSchema, endsAt: localDateTimeSchema }),
)
const weeklyRule = { frequency: "weekly", weekdays: ["wednesday"], until: "2026-12-30" }
const categoryId = "6f9619ff-8b86-4d11-b42d-00c04fc964ff"
const sampleEvent = {
    title: "Jazz al Chiostro",
    description: null,
    categoryIds: [categoryId],
    primaryCategoryId: categoryId,
    venueId: "3f1a6d2e-9b7c-4c1f-8a2d-5e6f7a8b9c0d",
    startsAt: "2026-10-14T21:00",
    endsAt: "2026-10-15T00:30",
    recurrence: null,
    photoKeys: ["events/sample/cover.jpg"],
    externalLinks: { instagramUrl: null, facebookUrl: null },
    price: null,
}

/**
 * @remarks Typed as a full record, so every `FormIssueKey` needs a field raising it
 */
export const formErrorsShowcaseFields: Record<FormIssueKey, FormErrorsShowcaseField> = {
    "FormErrors.Required": { schema: z.string(), initial: text(undefined) },
    "FormErrors.InvalidType.Default": {
        schema: raising(input => ({ code: "invalid_type", expected: "custom", input })),
        initial: text("custom"),
    },
    "FormErrors.InvalidType.string": { schema: z.string(), initial: number(42) },
    "FormErrors.InvalidType.number": { schema: z.number(), initial: text("forty-two") },
    "FormErrors.InvalidType.int": { schema: z.int(), initial: number(1.5) },
    "FormErrors.InvalidType.boolean": { schema: z.boolean(), initial: text("yes") },
    "FormErrors.InvalidType.bigint": { schema: z.bigint(), initial: text("42") },
    "FormErrors.InvalidType.symbol": { schema: z.symbol(), initial: text("symbol") },
    "FormErrors.InvalidType.undefined": {
        schema: z.undefined(),
        initial: text("defined"),
    },
    "FormErrors.InvalidType.null": { schema: z.null(), initial: text("not null") },
    "FormErrors.InvalidType.never": { schema: z.never(), initial: text("something") },
    "FormErrors.InvalidType.void": { schema: z.void(), initial: text("value") },
    "FormErrors.InvalidType.date": { schema: z.date(), initial: text("2024-01-01") },
    "FormErrors.InvalidType.array": {
        schema: z.array(z.string()),
        initial: text("a, b"),
    },
    "FormErrors.InvalidType.object": { schema: z.object({}), initial: text("{}") },
    "FormErrors.InvalidType.tuple": {
        schema: z.tuple([z.string()]),
        initial: text("[a]"),
    },
    "FormErrors.InvalidType.record": {
        schema: z.record(z.string(), z.string()),
        initial: text("{}"),
    },
    "FormErrors.InvalidType.map": {
        schema: z.map(z.string(), z.string()),
        initial: text("{}"),
    },
    "FormErrors.InvalidType.set": { schema: z.set(z.string()), initial: text("a") },
    "FormErrors.InvalidType.file": { schema: z.file(), initial: text("file.txt") },
    "FormErrors.InvalidType.nonoptional": {
        schema: raising(input => ({
            code: "invalid_type",
            expected: "nonoptional",
            input,
        })),
        initial: text("optional"),
    },
    "FormErrors.InvalidType.nan": { schema: z.nan(), initial: text("1") },
    "FormErrors.InvalidType.function": { schema: z.function(), initial: text("fn") },

    "FormErrors.TooSmall.Default": {
        schema: raising(input => ({
            code: "too_small",
            origin: "custom",
            minimum: 1,
            input,
        })),
        initial: text("x"),
    },
    "FormErrors.TooSmall.string.Inclusive": {
        schema: z.string().min(5),
        initial: text("abc"),
    },
    "FormErrors.TooSmall.string.Exact": {
        schema: z.string().length(5),
        initial: text("abc"),
    },
    "FormErrors.TooSmall.array.Inclusive": {
        schema: z.array(z.string()).min(2),
        initial: shown(["a"], '["a"]'),
    },
    "FormErrors.TooSmall.array.Exact": {
        schema: z.array(z.string()).length(2),
        initial: shown(["a"], '["a"]'),
    },
    "FormErrors.TooSmall.set.Inclusive": {
        schema: z.set(z.string()).min(2),
        initial: shown(new Set(["a"]), 'Set { "a" }'),
    },
    "FormErrors.TooSmall.set.Exact": {
        schema: z.set(z.string()).size(2),
        initial: shown(new Set(["a"]), 'Set { "a" }'),
    },
    "FormErrors.TooSmall.map.Inclusive": {
        schema: z.map(z.string(), z.string()).min(1),
        initial: shown(new Map(), "Map {}"),
    },
    "FormErrors.TooSmall.map.Exact": {
        schema: z.map(z.string(), z.string()).size(1),
        initial: shown(new Map(), "Map {}"),
    },
    "FormErrors.TooSmall.file.Inclusive": {
        schema: z.file().min(10),
        initial: shown(sampleFile(), "sample.txt (1 byte)"),
    },
    "FormErrors.TooSmall.file.Exact": {
        schema: z.file().check(z.size(10)),
        initial: shown(sampleFile(), "sample.txt (1 byte)"),
    },
    "FormErrors.TooSmall.number.Inclusive": {
        schema: z.number().min(5),
        initial: number(3),
    },
    "FormErrors.TooSmall.number.Exclusive": {
        schema: z.number().gt(5),
        initial: number(5),
    },
    "FormErrors.TooSmall.int.Inclusive": {
        schema: raising(input => ({
            code: "too_small",
            origin: "int",
            minimum: 5,
            inclusive: true,
            input,
        })),
        initial: number(3),
    },
    "FormErrors.TooSmall.int.Exclusive": {
        schema: raising(input => ({
            code: "too_small",
            origin: "int",
            minimum: 5,
            inclusive: false,
            input,
        })),
        initial: number(5),
    },
    "FormErrors.TooSmall.bigint.Inclusive": {
        schema: z.bigint().min(5n),
        initial: shown(3n, "3"),
    },
    "FormErrors.TooSmall.bigint.Exclusive": {
        schema: z.bigint().gt(5n),
        initial: shown(5n, "5"),
    },
    "FormErrors.TooSmall.date.Inclusive": {
        schema: z.date().min(futureDate),
        initial: date(pastDate),
    },
    "FormErrors.TooSmall.date.Exclusive": {
        schema: z.date().check(z.gt(futureDate)),
        initial: date(pastDate),
    },

    "FormErrors.TooBig.Default": {
        schema: raising(input => ({
            code: "too_big",
            origin: "custom",
            maximum: 1,
            input,
        })),
        initial: text("xx"),
    },
    "FormErrors.TooBig.string.Inclusive": {
        schema: z.string().max(2),
        initial: text("abc"),
    },
    "FormErrors.TooBig.string.Exact": {
        schema: z.string().length(2),
        initial: text("abc"),
    },
    "FormErrors.TooBig.array.Inclusive": {
        schema: z.array(z.string()).max(0),
        initial: shown(["a"], '["a"]'),
    },
    "FormErrors.TooBig.array.Exact": {
        schema: z.array(z.string()).length(0),
        initial: shown(["a"], '["a"]'),
    },
    "FormErrors.TooBig.set.Inclusive": {
        schema: z.set(z.string()).max(0),
        initial: shown(new Set(["a"]), 'Set { "a" }'),
    },
    "FormErrors.TooBig.set.Exact": {
        schema: z.set(z.string()).size(0),
        initial: shown(new Set(["a"]), 'Set { "a" }'),
    },
    "FormErrors.TooBig.map.Inclusive": {
        schema: z.map(z.string(), z.string()).max(0),
        initial: shown(new Map([["a", "b"]]), 'Map { "a" => "b" }'),
    },
    "FormErrors.TooBig.map.Exact": {
        schema: z.map(z.string(), z.string()).size(0),
        initial: shown(new Map([["a", "b"]]), 'Map { "a" => "b" }'),
    },
    "FormErrors.TooBig.file.Inclusive": {
        schema: z.file().max(0),
        initial: shown(sampleFile(), "sample.txt (1 byte)"),
    },
    "FormErrors.TooBig.file.Exact": {
        schema: z.file().check(z.size(0)),
        initial: shown(sampleFile(), "sample.txt (1 byte)"),
    },
    "FormErrors.TooBig.number.Inclusive": {
        schema: z.number().max(5),
        initial: number(7),
    },
    "FormErrors.TooBig.number.Exclusive": {
        schema: z.number().lt(5),
        initial: number(5),
    },
    "FormErrors.TooBig.int.Inclusive": {
        schema: raising(input => ({
            code: "too_big",
            origin: "int",
            maximum: 5,
            inclusive: true,
            input,
        })),
        initial: number(7),
    },
    "FormErrors.TooBig.int.Exclusive": {
        schema: raising(input => ({
            code: "too_big",
            origin: "int",
            maximum: 5,
            inclusive: false,
            input,
        })),
        initial: number(5),
    },
    "FormErrors.TooBig.bigint.Inclusive": {
        schema: z.bigint().max(5n),
        initial: shown(7n, "7"),
    },
    "FormErrors.TooBig.bigint.Exclusive": {
        schema: z.bigint().lt(5n),
        initial: shown(5n, "5"),
    },
    "FormErrors.TooBig.date.Inclusive": {
        schema: z.date().max(pastDate),
        initial: date(futureDate),
    },
    "FormErrors.TooBig.date.Exclusive": {
        schema: z.date().check(z.lt(pastDate)),
        initial: date(futureDate),
    },

    "FormErrors.InvalidFormat.Default": {
        schema: raising(input => ({
            code: "invalid_format",
            format: "custom",
            input: String(input),
        })),
        initial: text("x"),
    },
    "FormErrors.InvalidFormat.email": {
        schema: z.email(),
        initial: text("not-an-email"),
    },
    "FormErrors.InvalidFormat.url": { schema: z.url(), initial: text("not a url") },
    "FormErrors.InvalidFormat.emoji": { schema: z.emoji(), initial: text("abc") },
    "FormErrors.InvalidFormat.uuid": { schema: z.uuid(), initial: text("not-an-id") },
    "FormErrors.InvalidFormat.guid": { schema: z.guid(), initial: text("not-an-id") },
    "FormErrors.InvalidFormat.nanoid": { schema: z.nanoid(), initial: text("not-an-id") },
    "FormErrors.InvalidFormat.cuid": {
        // CUID v1 is deprecated in Zod, so the format check is declared by name
        schema: z.stringFormat("cuid", () => false),
        initial: text("not-an-id"),
    },
    "FormErrors.InvalidFormat.cuid2": { schema: z.cuid2(), initial: text("not-an-id") },
    "FormErrors.InvalidFormat.ulid": { schema: z.ulid(), initial: text("not-an-id") },
    "FormErrors.InvalidFormat.xid": { schema: z.xid(), initial: text("not-an-id") },
    "FormErrors.InvalidFormat.ksuid": { schema: z.ksuid(), initial: text("not-an-id") },
    "FormErrors.InvalidFormat.datetime": {
        schema: z.iso.datetime(),
        initial: text("yesterday"),
    },
    "FormErrors.InvalidFormat.date": { schema: z.iso.date(), initial: text("yesterday") },
    "FormErrors.InvalidFormat.time": { schema: z.iso.time(), initial: text("noon") },
    "FormErrors.InvalidFormat.duration": {
        schema: z.iso.duration(),
        initial: text("1 hour"),
    },
    "FormErrors.InvalidFormat.ipv4": { schema: z.ipv4(), initial: text("localhost") },
    "FormErrors.InvalidFormat.ipv6": { schema: z.ipv6(), initial: text("localhost") },
    "FormErrors.InvalidFormat.cidrv4": { schema: z.cidrv4(), initial: text("localhost") },
    "FormErrors.InvalidFormat.cidrv6": { schema: z.cidrv6(), initial: text("localhost") },
    "FormErrors.InvalidFormat.base64": {
        schema: z.base64(),
        initial: text("not base64!"),
    },
    "FormErrors.InvalidFormat.base64url": {
        schema: z.base64url(),
        initial: text("not base64!"),
    },
    "FormErrors.InvalidFormat.json_string": {
        schema: z.stringFormat("json_string", isJson),
        initial: text("{ not json }"),
    },
    "FormErrors.InvalidFormat.e164": { schema: z.e164(), initial: text("555-0100") },
    "FormErrors.InvalidFormat.credit_card": {
        schema: z.creditCard(),
        initial: text("4111 1111 1111 1112"),
    },
    "FormErrors.InvalidFormat.iban": { schema: z.iban(), initial: text("IT00X000") },
    "FormErrors.InvalidFormat.lowercase": {
        schema: z.string().lowercase(),
        initial: text("MiXeD"),
    },
    "FormErrors.InvalidFormat.uppercase": {
        schema: z.string().uppercase(),
        initial: text("MiXeD"),
    },
    "FormErrors.InvalidFormat.regex": {
        schema: z.string().regex(/^\d+$/u),
        initial: text("abc"),
    },
    "FormErrors.InvalidFormat.jwt": { schema: z.jwt(), initial: text("not.a.jwt") },
    "FormErrors.InvalidFormat.starts_with": {
        schema: z.string().startsWith("prefix-"),
        initial: text("value"),
    },
    "FormErrors.InvalidFormat.ends_with": {
        schema: z.string().endsWith("-suffix"),
        initial: text("value"),
    },
    "FormErrors.InvalidFormat.includes": {
        schema: z.string().includes("needle"),
        initial: text("haystack"),
    },

    "FormErrors.InvalidValue": {
        schema: z.enum(["low", "medium", "high"]),
        initial: text("urgent"),
    },
    "FormErrors.NotMultipleOf": { schema: z.number().multipleOf(5), initial: number(7) },
    "FormErrors.UnrecognizedKeys": {
        schema: z.strictObject({}),
        initial: shown({ extra: true }, '{ "extra": true }'),
    },

    "FormErrors.Custom.not-semver": { schema: semverSchema, initial: text("1.4") },
    "FormErrors.Custom.empty-update": {
        schema: nonEmptyUpdate(z.object({ note: z.string().optional() })),
        initial: shown({}, "{}"),
    },
    "FormErrors.Custom.end-before-start": {
        schema: timeRangeSchema,
        initial: shown(
            { startsAt: "2026-10-14T21:00", endsAt: "2026-10-14T20:00" },
            "21:00 → 20:00",
        ),
    },
    "FormErrors.Custom.duration-too-long": {
        schema: timeRangeSchema,
        initial: shown(
            { startsAt: "2026-10-14T21:00", endsAt: "2026-10-17T21:00" },
            "3 days",
        ),
    },
    "FormErrors.Custom.until-before-first-date": {
        schema: eventUpsertSchema,
        initial: shown(
            {
                ...sampleEvent,
                recurrence: {
                    rule: { ...weeklyRule, until: "2026-10-01" },
                    addedDates: [],
                    removedDates: [],
                },
            },
            "until 2026-10-01, first date 2026-10-14",
        ),
    },
    "FormErrors.Custom.primary-category-not-in-list": {
        schema: eventUpsertSchema,
        initial: shown(
            { ...sampleEvent, primaryCategoryId: crypto.randomUUID() },
            "primary category outside the list",
        ),
    },
    "FormErrors.Custom.duplicate-date": {
        schema: recurrenceSchema,
        initial: shown(
            {
                rule: weeklyRule,
                addedDates: ["2026-10-20", "2026-10-20"],
                removedDates: [],
            },
            "2026-10-20 added twice",
        ),
    },
    "FormErrors.Custom.date-added-and-removed": {
        schema: recurrenceSchema,
        initial: shown(
            {
                rule: weeklyRule,
                addedDates: ["2026-10-20"],
                removedDates: ["2026-10-20"],
            },
            "2026-10-20 added and removed",
        ),
    },
    "FormErrors.Custom.range-incomplete": {
        schema: publicSearchQuerySchema,
        initial: shown(
            { lat: "44.35", lng: "11.71", date: "range", from: "2026-10-14" },
            "range from 2026-10-14 with no end",
        ),
    },
}

const formErrorsShowcaseSchema = z.object(
    mapValues(formErrorsShowcaseFields, field => field.schema),
)
//#endregion

//#region Initial State
export const initialFormErrorsShowcaseState = (): FormErrorsShowcaseState =>
    mapValues(formErrorsShowcaseFields, field => field.initial)
//#endregion

//#region Conversions
/**
 * @description Validates every showcase value against its field schema
 * @param state State converted
 * @param parse Parser of the host app, bound to its language and error map
 */
export const formErrorsShowcaseStateToOutput = (
    state: FormErrorsShowcaseState,
    parse: FormStateParser,
): FormResult<FormErrorsShowcaseState, Record<FormIssueKey, unknown>> => {
    const parsed = parse(
        formErrorsShowcaseSchema,
        mapValues(state, entry => entry.value),
    )
    return parsed.success
        ? Result.ok(parsed.data)
        : Result.err(z.treeifyError(parsed.error).properties ?? {})
}

/**
 * @description Returns the error messages of every field, keyed by field name
 * @param errors Error trees of the last conversion
 */
export const formErrorsShowcaseMessages = (
    errors: FormErrors<FormErrorsShowcaseState> | undefined,
): Map<string, string[]> =>
    new Map(Object.entries(errors ?? {}).map(([key, tree]) => [key, tree.errors]))
//#endregion
