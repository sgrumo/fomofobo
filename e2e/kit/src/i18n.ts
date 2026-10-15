import { readFileSync } from "node:fs"
import path from "node:path"

import { z } from "zod"

/**
 * @remarks Tests must pin the app to this locale so on-page strings match `t()`
 */
export const e2eLocale = "it"

const recordSchema = z.record(z.string(), z.unknown())

/**
 * @description Returns the string at a dot-notation path inside a namespace object
 * @param obj Parsed namespace object
 * @param keyPath Dot-notation path to the translation
 * @param namespace i18n namespace, for error messages
 * @throws When the path is not navigable or the value is not a string
 */
const getNestedString = (obj: unknown, keyPath: string, namespace: string): string => {
    const value = keyPath.split(".").reduce<unknown>((current, key) => {
        const record = recordSchema.safeParse(current)
        if (!record.success) {
            throw new Error(`translation path not navigable: ${namespace}:${keyPath}`)
        }
        return record.data[key]
    }, obj)

    if (typeof value !== "string") {
        throw new TypeError(
            `translation value at "${namespace}:${keyPath}" is not a string, got: ${typeof value}`,
        )
    }

    return value
}

/**
 * @description Replaces every `{{key}}` token in the template with its param value
 * @param template Translation template
 * @param params Values for the `{{key}}` interpolation tokens
 * @param namespace i18n namespace, for error messages
 * @param keyPath Dot-notation path to the translation, for error messages
 * @throws When a param has no matching token
 */
const interpolate = (
    template: string,
    params: Record<string, string | number>,
    namespace: string,
    keyPath: string,
): string =>
    Object.entries(params).reduce((acc, [key, value]) => {
        const token = `{{${key}}}`
        if (!acc.includes(token)) {
            throw new Error(
                `translation "${namespace}:${keyPath}" has no "${token}" token`,
            )
        }
        return acc.replaceAll(token, String(value))
    }, template)

/**
 * @description Builds the translator over the E2E locale of a locales directory
 * @param localesDir Directory holding one sub-directory per locale
 */
export const createI18n = (localesDir: string) => {
    const cache = new Map<string, unknown>()

    /**
     * @description Returns the parsed JSON of a namespace file, with a per-namespace cache
     * @param namespace i18n namespace loaded
     */
    const loadNamespace = (namespace: string): unknown => {
        const cached = cache.get(namespace)
        if (cached !== undefined) {
            return cached
        }

        const filePath = path.resolve(localesDir, e2eLocale, `${namespace}.json`)
        const data: unknown = JSON.parse(readFileSync(filePath, "utf8"))
        cache.set(namespace, data)
        return data
    }

    /**
     * @description Returns a translated string from the committed i18n JSON files
     * @param namespace i18n namespace read
     * @param keyPath Dot-notation path to the translation
     * @param params Values for the `{{key}}` interpolation tokens
     */
    const t = (
        namespace: string,
        keyPath: string,
        params?: Record<string, string | number>,
    ): string => {
        const template = getNestedString(loadNamespace(namespace), keyPath, namespace)
        return params ? interpolate(template, params, namespace, keyPath) : template
    }

    return { t }
}
