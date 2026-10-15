import { z } from "zod"

export interface NestedObject {
    [key: string]: string | NestedObject
}

export const nestedObjectSchema: z.ZodType<NestedObject> = z.record(
    z.string(),
    z.union([z.string(), z.lazy(() => nestedObjectSchema)]),
)

/**
 * @description Maps a nested translations object to a flat map keyed by dot-joined path
 * @param obj Nested translations object
 * @param prefix Path prepended to every key
 */
export const flattenNestedObject = (
    obj: NestedObject,
    prefix = "",
): Record<string, string> =>
    Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === "string") {
            acc[fullKey] = value
        } else {
            Object.assign(acc, flattenNestedObject(value, fullKey))
        }

        return acc
    }, {})

/**
 * @description Builds a nested translations object from dot-joined keys
 * @param flat Translations keyed by dot-joined path
 * @remarks Replaces a string value with an object when a longer key needs that path
 */
export const buildNestedObject = (flat: Record<string, string>): NestedObject => {
    const result: NestedObject = {}

    for (const [key, value] of Object.entries(flat)) {
        const parts = key.split(".")
        let current: NestedObject = result

        for (let i = 0; i < parts.length - 1; i += 1) {
            const part = parts[i]
            if (part === undefined) {
                continue
            }
            if (!(part in current) || typeof current[part] === "string") {
                current[part] = {}
            }
            const next = current[part]
            if (typeof next === "object") {
                current = next
            }
        }

        const lastPart = parts.at(-1)
        if (lastPart !== undefined) {
            current[lastPart] = value
        }
    }

    return result
}

/**
 * @description Builds the CSV text holding one row per key and one column per language
 * @param languages Language codes forming the columns
 * @param translationsByLang Flat translations per language code
 * @remarks Quotes a value holding a comma, a quote, or a newline
 */
export const generateCsv = (
    languages: string[],
    translationsByLang: Record<string, Record<string, string>>,
): string => {
    const allKeys = [
        ...new Set(
            languages.reduce<string[]>((acc, lang) => {
                acc.push(...Object.keys(translationsByLang[lang] ?? {}))
                return acc
            }, []),
        ),
    ].toSorted()

    const header = ["ID", ...languages].join(",")
    const rows = allKeys.map(key => {
        const values = languages.map(lang => {
            const value = translationsByLang[lang]?.[key] || ""
            return value.includes(",") || value.includes('"') || value.includes("\n")
                ? `"${value.replaceAll('"', '""')}"`
                : value
        })
        return [key, ...values].join(",")
    })

    return [header, ...rows].join("\n")
}
