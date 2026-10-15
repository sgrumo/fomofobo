import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { camelCase, kebabCase } from "es-toolkit"
import { languageKeys, languageKeySchema } from "i18n/i18n"
import { match } from "ts-pattern"
import { describe, expect, it } from "vitest"
import type { ZodType } from "zod"
import { z, ZodArray, ZodObject, ZodOptional, ZodString } from "zod"

import { routeHandlers, routes } from "./routes"
import type {
    ParsedSegment,
    Route,
    RouteParameters,
    RouteQuery,
    RouteSegments,
} from "./routes.helper"
import { parseSegment } from "./routes.helper"

const appDirectory = fileURLToPath(new URL("../../app", import.meta.url))

/**
 * @description Returns the path of every `src/app` file with the name
 * @param fileName File name looked for
 */
const appFilePaths = (fileName: string): string[] =>
    readdirSync(appDirectory, { recursive: true, withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name === fileName)
        .map(entry => path.join(entry.parentPath, entry.name))

/**
 * @description Returns every `src/app` file with the name, keyed by its URL segments
 * @param fileName File name looked for
 * @remarks Drops the route group folders, which hold no URL segment, so two files that
 * differ by a group alone share one key
 */
const appFiles = (fileName: string): Map<string, string> =>
    new Map(
        appFilePaths(fileName).map(file => [
            path
                .relative(appDirectory, path.dirname(file))
                .split(path.sep)
                .filter(segment => segment !== "" && !segment.startsWith("("))
                .join("/"),
            file,
        ]),
    )

/**
 * @description Returns the URL segments of every `src/app` file with the name
 * @param fileName File name looked for
 */
const appFileSegments = (fileName: string): Set<string> =>
    new Set(appFiles(fileName).keys())

const ledgerReference = /\broutes\.\w+/u
const staticParamsReference = /\bgenerateStaticParams\b/u
const segmentConfigDeclaration = /^export const dynamic\b/u
const staticParamsExport =
    "export const generateStaticParams = route.generateStaticParams"

/**
 * @description Returns the lines of the `page.tsx` of the route
 * @param route Route whose page is read
 */
const pageLines = (
    route: Pick<Route<RouteSegments, RouteParameters, RouteQuery>, "segments">,
) => {
    const page = appFiles("page.tsx").get(route.segments.join("/"))
    return page === undefined ? [] : readFileSync(page, "utf8").split("\n")
}

/**
 * @description True when the lines hold the line exactly once
 * @param lines Lines of the page
 * @param line Line looked for, matched whole
 */
const holdsOnce = (lines: string[], line: string): boolean =>
    lines.filter(candidate => candidate === line).length === 1

/**
 * @description True when the page declares `const route = routes.<name>` once, at the top
 * level, and reads no ledger key anywhere else
 * @param lines Lines of the `page.tsx`, none when the route has no page
 * @param name Key of the route in the ledger
 * @remarks Rejects every other `routes.<key>` too, not only the key of the page
 */
const declaresRoute = (lines: string[], name: string): boolean => {
    const declaration = `const route = routes.${name}`
    const otherReferences = lines.filter(
        line => line !== declaration && ledgerReference.test(line),
    )

    return holdsOnce(lines, declaration) && otherReferences.length === 0
}

/**
 * @description True when the page exports `generateStaticParams` from the route once, and
 * names it nowhere else
 * @param lines Lines of the `page.tsx`, none when the route has no page
 */
const exportsStaticParams = (lines: string[]): boolean =>
    holdsOnce(lines, staticParamsExport) &&
    lines.filter(line => staticParamsReference.test(line)).length === 1

/**
 * @description Asserts each route holds object schemas, then runs the callback per route
 * @param fn Callback receiving a route with narrowed schemas
 */
const forEachRoute = (
    fn: (
        route: Pick<Route<RouteSegments, RouteParameters, RouteQuery>, "segments"> & {
            parametersSchema: ZodObject<Record<string, ZodType>>
            querySchema: ZodObject<Record<string, ZodType>>
        },
    ) => void,
) => {
    for (const route of Object.values(routes)) {
        expect(route.parametersSchema).toBeInstanceOf(ZodObject)
        expect(route.querySchema).toBeInstanceOf(ZodObject)
        if (
            !(route.parametersSchema instanceof ZodObject) ||
            !(route.querySchema instanceof ZodObject)
        ) {
            continue
        }

        fn({
            ...route,
            parametersSchema: route.parametersSchema,
            querySchema: route.querySchema,
        })
    }
}

/**
 * @description True when the schema is `z.string()` with no check and no format
 * @param schema Schema of one parameter
 */
const isPlainString = (schema: unknown): boolean =>
    schema instanceof ZodString && (schema.def.checks ?? []).length === 0

/**
 * @description True when the schema is `z.array(z.string())` with no check on either level
 * @param schema Schema of one catch-all parameter
 */
const isPlainStringArray = (schema: unknown): boolean =>
    schema instanceof ZodArray &&
    (schema.def.checks ?? []).length === 0 &&
    isPlainString(schema.element)

/**
 * @description True when the shape holds the schema the segment asks for: the language
 * enum for the first `[lang]` segment, a plain string schema for every other one
 * @param parsed Segment read
 * @param index Position of the segment in the route
 * @param shape Shape of the parameters schema
 */
const isExpectedParameter = (
    parsed: ParsedSegment,
    index: number,
    shape: Record<string, ZodType>,
): boolean =>
    match(parsed)
        .with({ type: "static" }, () => true)
        .with(
            { type: "parameter", name: "lang" },
            ({ name }) => index === 0 && shape[name] === languageKeySchema,
        )
        .with({ type: "parameter" }, ({ name }) => isPlainString(shape[name]))
        .with({ type: "catch-all" }, ({ name }) => isPlainStringArray(shape[name]))
        .with({ type: "optional-catch-all" }, ({ name }) => {
            const schema = shape[name]
            return schema instanceof ZodOptional && isPlainStringArray(schema.unwrap())
        })
        .exhaustive()

describe("route objects", () => {
    describe("segments", () => {
        it("should match one `page.tsx` each, and every `page.tsx` a route", () => {
            const ledger = new Set(
                Object.values(routes).map(route => route.segments.join("/")),
            )
            expect(ledger).toStrictEqual(appFileSegments("page.tsx"))
        })

        it("should open with the `[lang]` segment", () => {
            const withoutLanguage = Object.entries(routes)
                .filter(([, route]) => {
                    const segments: readonly string[] = route.segments
                    return segments[0] !== "[lang]"
                })
                .map(([name]) => name)
            expect(withoutLanguage).toStrictEqual([])
        })

        it("should be declared as `const route = routes.<name>` by its `page.tsx`", () => {
            const undeclared = Object.entries(routes)
                .filter(([name, route]) => !declaresRoute(pageLines(route), name))
                .map(([name]) => name)
            expect(undeclared).toStrictEqual([])
        })
    })

    describe("type", () => {
        const staticEntries = Object.entries(routes).filter(
            ([, route]) => route.type === "static",
        )
        const dynamicEntries = Object.entries(routes).filter(
            ([, route]) => route.type === "dynamic",
        )

        it("should export `generateStaticParams` from the route in the `page.tsx` of a static route", () => {
            const unexported = staticEntries
                .filter(([, route]) => !exportsStaticParams(pageLines(route)))
                .map(([name]) => name)
            expect(unexported).toStrictEqual([])
        })

        it("should declare no `dynamic` segment config in the `page.tsx` of a static route", () => {
            const configured = staticEntries
                .filter(([, route]) =>
                    pageLines(route).some(line => segmentConfigDeclaration.test(line)),
                )
                .map(([name]) => name)
            expect(configured).toStrictEqual([])
        })

        it("should name `generateStaticParams` nowhere in the `page.tsx` of a dynamic route", () => {
            const exported = dynamicEntries
                .filter(([, route]) =>
                    pageLines(route).some(line => staticParamsReference.test(line)),
                )
                .map(([name]) => name)
            expect(exported).toStrictEqual([])
        })

        it("should name `generateStaticParams` in no `layout.tsx`", () => {
            const exported = appFilePaths("layout.tsx").filter(layout =>
                readFileSync(layout, "utf8")
                    .split("\n")
                    .some(line => staticParamsReference.test(line)),
            )
            expect(exported).toStrictEqual([])
        })

        it("should generate parameters that pass the schema, one set per language", async () => {
            const staticRoutes = Object.values(routes).filter(
                route => route.type === "static",
            )
            for (const route of staticRoutes) {
                const parameters = await route.generateStaticParams()
                const rejected = parameters.filter(
                    item => !route.parametersSchema.safeParse(item).success,
                )
                expect(rejected).toStrictEqual([])
                expect(new Set(parameters.map(item => item.lang))).toStrictEqual(
                    new Set(languageKeys),
                )
            }
        })
    })

    describe("parameters schema", () => {
        it("should match the bracket segments", () => {
            forEachRoute(route => {
                const segmentParameters = new Set(
                    route.segments
                        .map(segment => parseSegment(segment))
                        .filter(parsed => parsed.type !== "static")
                        .map(parsed => parsed.name),
                )
                const schemaParameters = new Set(
                    Object.keys(route.parametersSchema.shape),
                )
                expect(schemaParameters).toStrictEqual(segmentParameters)
            })
        })

        it("should hold the language enum for the `[lang]` segment and a plain string schema, with no check, per other bracket segment", () => {
            forEachRoute(route => {
                const invalidSegments = route.segments.filter(
                    (segment, index) =>
                        !isExpectedParameter(
                            parseSegment(segment),
                            index,
                            route.parametersSchema.shape,
                        ),
                )
                expect(invalidSegments).toStrictEqual([])
            })
        })

        it("should require the language enum itself for the first `[lang]` segment", () => {
            const shape = { lang: languageKeySchema, id: languageKeySchema }
            expect(isExpectedParameter(parseSegment("[lang]"), 0, shape)).toBe(true)
            expect(isExpectedParameter(parseSegment("[lang]"), 1, shape)).toBe(false)
            expect(isExpectedParameter(parseSegment("[id]"), 0, shape)).toBe(false)
            expect(isExpectedParameter(parseSegment("[id]"), 1, shape)).toBe(false)
            const otherSchemas = [
                z.string(),
                z.enum(["en", "it"]),
                languageKeySchema.catch("en"),
                languageKeySchema.optional(),
            ]
            expect(
                otherSchemas.filter(lang =>
                    isExpectedParameter(parseSegment("[lang]"), 0, { lang }),
                ),
            ).toStrictEqual([])
        })

        it("should reject a string schema holding a check or a format", () => {
            expect(isPlainString(z.string())).toBe(true)
            expect(isPlainStringArray(z.array(z.string()))).toBe(true)
            const invalidStrings = [
                z.string().min(1),
                z.string().max(10),
                z.string().regex(/^a$/u),
                z.string().trim(),
                z.uuid(),
                z.string().catch("a"),
                z.number(),
            ]
            expect(invalidStrings.filter(schema => isPlainString(schema))).toStrictEqual(
                [],
            )
            const invalidArrays = [
                z.array(z.string()).min(1),
                z.array(z.uuid()),
                z.array(z.string().min(1)),
                z.string(),
            ]
            expect(
                invalidArrays.filter(schema => isPlainStringArray(schema)),
            ).toStrictEqual([])
        })
    })

    describe("query schema", () => {
        it("should successfully parse the empty object", () => {
            forEachRoute(route => {
                expect(() => {
                    route.querySchema.parse({})
                }).not.toThrow()
            })
        })

        it("should successfully parse all objects whose values do not match the related keys schemas", () => {
            class TestOnlyClass<T> {
                private value: T | null = null
                public constructor(value: T) {
                    this.value ??= value
                }
            }

            forEachRoute(route => {
                const queryKeys = Object.keys(route.querySchema.shape)
                const nonMatchingObject = queryKeys.reduce<Record<string, unknown>>(
                    (obj, key) => {
                        obj[key] = new TestOnlyClass(0)
                        return obj
                    },
                    {},
                )

                expect(() => {
                    route.querySchema.parse(nonMatchingObject)
                }).not.toThrow()
            })
        })

        it("should be encodable", () => {
            forEachRoute(route => {
                const defaultQuerySchema = route.querySchema.parse({})
                expect(() =>
                    route.querySchema.safeEncode(defaultQuerySchema),
                ).not.toThrow()
            })
        })

        it("should contain keys that can be safely converted to kebab case and back to camel case", () => {
            forEachRoute(route => {
                for (const key of Object.keys(route.querySchema.shape)) {
                    expect(key).toBe(camelCase(kebabCase(key)))
                }
            })
        })
    })
})

describe("route handler objects", () => {
    it("should match one `route.ts` each, and every `route.ts` a handler", () => {
        const ledger = new Set(
            Object.values(routeHandlers).map(handler => handler.segments.join("/")),
        )
        expect(ledger).toStrictEqual(appFileSegments("route.ts"))
    })
})
