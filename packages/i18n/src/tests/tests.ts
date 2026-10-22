/// <reference types="node" />
// The consuming app compiles this module with a DOM `lib`, so the Node types come from here.
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { difference } from "es-toolkit"
import type { FormIssueKey } from "frontend-shared/types"

import { flattenNestedObject, nestedObjectSchema } from "../translations/translations"

type FlatTranslations = Record<string, string>

export interface Locales {
    /**
     * Language directory names, sorted. The first one is the reference.
     */
    languages: string[]
    /**
     * Namespace file names without the extension, sorted
     */
    namespaces: string[]
    /**
     * Flat translations, keyed by language then namespace
     */
    flat: Record<string, Record<string, FlatTranslations>>
}

export interface ShapeMismatch {
    namespace: string
    language: string
    missingKeys: string[]
    extraKeys: string[]
}

export interface NamespaceMismatch {
    /**
     * Declared namespaces with no file on disk
     */
    missing: string[]
    /**
     * Namespaces on disk the app does not declare
     */
    undeclared: string[]
}

export interface InterpolationMismatch {
    namespace: string
    language: string
    key: string
    reference: string[]
    actual: string[]
}

/**
 * @description Returns the language directory names under the locales root, sorted
 * @param localesDir Locales root path
 */
const readLanguages = (localesDir: string): string[] =>
    readdirSync(localesDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .toSorted()

/**
 * @description Returns every namespace name found in the language directories, sorted
 * @param localesDir Locales root path
 * @param languages Language directory names read
 */
const readNamespaces = (localesDir: string, languages: string[]): string[] =>
    [
        ...new Set(
            languages.flatMap(lang =>
                readdirSync(path.join(localesDir, lang))
                    .filter(file => file.endsWith(".json"))
                    .map(file => file.replace(/\.json$/u, "")),
            ),
        ),
    ].toSorted()

/**
 * @description Returns the flat translations of one language and namespace file
 * @param localesDir Locales root path
 * @param lang Language directory name
 * @param namespace Namespace file name, without the extension
 * @remarks Returns an empty map when the file is absent, so the shape check reports every key as missing
 */
const readFlatTranslations = (
    localesDir: string,
    lang: string,
    namespace: string,
): FlatTranslations => {
    const filePath = path.join(localesDir, lang, `${namespace}.json`)
    try {
        const raw: unknown = JSON.parse(readFileSync(filePath, "utf8"))
        return flattenNestedObject(nestedObjectSchema.parse(raw))
    } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") {
            return {}
        }
        throw error
    }
}

/**
 * @description Fetches every locale file under the root into flat translations
 * @param localesDir Locales root, holding one directory per language
 * @throws When the root holds no language directory
 */
export const readLocales = (localesDir: string | URL): Locales => {
    const root = typeof localesDir === "string" ? localesDir : fileURLToPath(localesDir)
    const languages = readLanguages(root)
    if (languages.length === 0) {
        throw new Error(`no language directory found in ${root}`)
    }
    const namespaces = readNamespaces(root, languages)

    const flat = Object.fromEntries(
        languages.map(lang => [
            lang,
            Object.fromEntries(
                namespaces.map(namespace => [
                    namespace,
                    readFlatTranslations(root, lang, namespace),
                ]),
            ),
        ]),
    )

    return { languages, namespaces, flat }
}

/**
 * @description Returns the flat translations of the language and namespace, empty when absent
 * @param locales Locales read
 * @param lang Language looked up
 * @param namespace Namespace looked up
 */
const flatOf = (locales: Locales, lang: string, namespace: string): FlatTranslations =>
    locales.flat[lang]?.[namespace] ?? {}

/**
 * @description Returns the reference language, the first sorted one
 * @param locales Locales read
 * @throws When the locales hold no language
 */
const referenceLanguage = (locales: Locales): string => {
    const [reference] = locales.languages
    if (reference === undefined) {
        throw new Error("no language found")
    }
    return reference
}

/**
 * @description Returns the `{{...}}` interpolations of the value, sorted
 * @param value Translation string scanned
 */
const extractInterpolations = (value: string): string[] =>
    (value.match(/\{\{(?<interpolation>\w+)\}\}/gu) ?? []).toSorted()

/**
 * @description Returns every language and namespace whose key set differs from the reference language
 * @param locales Locales read
 */
export const findShapeMismatches = (locales: Locales): ShapeMismatch[] => {
    const reference = referenceLanguage(locales)
    return locales.namespaces.flatMap(namespace => {
        const referenceKeys = Object.keys(flatOf(locales, reference, namespace))
        return locales.languages
            .filter(lang => lang !== reference)
            .map(lang => {
                const langKeys = Object.keys(flatOf(locales, lang, namespace))
                return {
                    namespace,
                    language: lang,
                    missingKeys: difference(referenceKeys, langKeys).toSorted(),
                    extraKeys: difference(langKeys, referenceKeys).toSorted(),
                }
            })
            .filter(
                mismatch =>
                    mismatch.missingKeys.length > 0 || mismatch.extraKeys.length > 0,
            )
    })
}

/**
 * @description Returns the declared namespaces absent from disk and the ones on disk left undeclared
 * @param locales Locales read
 * @param declared Namespaces the app passes to the i18next initializer
 */
export const findNamespaceMismatches = (
    locales: Locales,
    declared: readonly string[],
): NamespaceMismatch => ({
    missing: difference(declared, locales.namespaces).toSorted(),
    undeclared: difference(locales.namespaces, declared).toSorted(),
})

/**
 * @description Returns every key whose `{{...}}` interpolations differ from the reference language
 * @param locales Locales read
 * @remarks Skips a key the language lacks, so `findShapeMismatches` reports it one time
 */
export const findInterpolationMismatches = (
    locales: Locales,
): InterpolationMismatch[] => {
    const reference = referenceLanguage(locales)
    return locales.namespaces.flatMap(namespace => {
        const referenceFlat = flatOf(locales, reference, namespace)
        return locales.languages
            .filter(lang => lang !== reference)
            .flatMap(lang => {
                const langFlat = flatOf(locales, lang, namespace)
                return Object.entries(referenceFlat).flatMap(([key, value]) => {
                    const langValue = langFlat[key]
                    if (langValue === undefined) {
                        return []
                    }
                    const referenceInterpolations = extractInterpolations(value)
                    const actual = extractInterpolations(langValue)
                    return referenceInterpolations.join(",") === actual.join(",")
                        ? []
                        : [
                              {
                                  namespace,
                                  language: lang,
                                  key,
                                  reference: referenceInterpolations,
                                  actual,
                              },
                          ]
                })
            })
    })
}

/**
 * @description True when the flat translations hold the key, bare or as an i18next plural
 * @param flat Flat translations read
 * @param key Key looked up
 */
const hasTranslation = (flat: FlatTranslations, key: string): boolean =>
    Object.hasOwn(flat, key) || Object.hasOwn(flat, `${key}_other`)

/**
 * @remarks Typed as a full record, so a key added to `FormIssueKey` without an entry fails to compile here
 */
const formIssueKeyRecord: Record<FormIssueKey, true> = {
    "FormErrors.Required": true,
    "FormErrors.InvalidType.Default": true,
    "FormErrors.InvalidType.string": true,
    "FormErrors.InvalidType.number": true,
    "FormErrors.InvalidType.int": true,
    "FormErrors.InvalidType.boolean": true,
    "FormErrors.InvalidType.bigint": true,
    "FormErrors.InvalidType.symbol": true,
    "FormErrors.InvalidType.undefined": true,
    "FormErrors.InvalidType.null": true,
    "FormErrors.InvalidType.never": true,
    "FormErrors.InvalidType.void": true,
    "FormErrors.InvalidType.date": true,
    "FormErrors.InvalidType.array": true,
    "FormErrors.InvalidType.object": true,
    "FormErrors.InvalidType.tuple": true,
    "FormErrors.InvalidType.record": true,
    "FormErrors.InvalidType.map": true,
    "FormErrors.InvalidType.set": true,
    "FormErrors.InvalidType.file": true,
    "FormErrors.InvalidType.nonoptional": true,
    "FormErrors.InvalidType.nan": true,
    "FormErrors.InvalidType.function": true,
    "FormErrors.TooSmall.Default": true,
    "FormErrors.TooSmall.string.Inclusive": true,
    "FormErrors.TooSmall.string.Exact": true,
    "FormErrors.TooSmall.array.Inclusive": true,
    "FormErrors.TooSmall.array.Exact": true,
    "FormErrors.TooSmall.set.Inclusive": true,
    "FormErrors.TooSmall.set.Exact": true,
    "FormErrors.TooSmall.map.Inclusive": true,
    "FormErrors.TooSmall.map.Exact": true,
    "FormErrors.TooSmall.file.Inclusive": true,
    "FormErrors.TooSmall.file.Exact": true,
    "FormErrors.TooSmall.number.Inclusive": true,
    "FormErrors.TooSmall.number.Exclusive": true,
    "FormErrors.TooSmall.int.Inclusive": true,
    "FormErrors.TooSmall.int.Exclusive": true,
    "FormErrors.TooSmall.bigint.Inclusive": true,
    "FormErrors.TooSmall.bigint.Exclusive": true,
    "FormErrors.TooSmall.date.Inclusive": true,
    "FormErrors.TooSmall.date.Exclusive": true,
    "FormErrors.TooBig.Default": true,
    "FormErrors.TooBig.string.Inclusive": true,
    "FormErrors.TooBig.string.Exact": true,
    "FormErrors.TooBig.array.Inclusive": true,
    "FormErrors.TooBig.array.Exact": true,
    "FormErrors.TooBig.set.Inclusive": true,
    "FormErrors.TooBig.set.Exact": true,
    "FormErrors.TooBig.map.Inclusive": true,
    "FormErrors.TooBig.map.Exact": true,
    "FormErrors.TooBig.file.Inclusive": true,
    "FormErrors.TooBig.file.Exact": true,
    "FormErrors.TooBig.number.Inclusive": true,
    "FormErrors.TooBig.number.Exclusive": true,
    "FormErrors.TooBig.int.Inclusive": true,
    "FormErrors.TooBig.int.Exclusive": true,
    "FormErrors.TooBig.bigint.Inclusive": true,
    "FormErrors.TooBig.bigint.Exclusive": true,
    "FormErrors.TooBig.date.Inclusive": true,
    "FormErrors.TooBig.date.Exclusive": true,
    "FormErrors.InvalidFormat.Default": true,
    "FormErrors.InvalidFormat.email": true,
    "FormErrors.InvalidFormat.url": true,
    "FormErrors.InvalidFormat.emoji": true,
    "FormErrors.InvalidFormat.uuid": true,
    "FormErrors.InvalidFormat.guid": true,
    "FormErrors.InvalidFormat.nanoid": true,
    "FormErrors.InvalidFormat.cuid": true,
    "FormErrors.InvalidFormat.cuid2": true,
    "FormErrors.InvalidFormat.ulid": true,
    "FormErrors.InvalidFormat.xid": true,
    "FormErrors.InvalidFormat.ksuid": true,
    "FormErrors.InvalidFormat.datetime": true,
    "FormErrors.InvalidFormat.date": true,
    "FormErrors.InvalidFormat.time": true,
    "FormErrors.InvalidFormat.duration": true,
    "FormErrors.InvalidFormat.ipv4": true,
    "FormErrors.InvalidFormat.ipv6": true,
    "FormErrors.InvalidFormat.cidrv4": true,
    "FormErrors.InvalidFormat.cidrv6": true,
    "FormErrors.InvalidFormat.base64": true,
    "FormErrors.InvalidFormat.base64url": true,
    "FormErrors.InvalidFormat.json_string": true,
    "FormErrors.InvalidFormat.e164": true,
    "FormErrors.InvalidFormat.credit_card": true,
    "FormErrors.InvalidFormat.iban": true,
    "FormErrors.InvalidFormat.lowercase": true,
    "FormErrors.InvalidFormat.uppercase": true,
    "FormErrors.InvalidFormat.regex": true,
    "FormErrors.InvalidFormat.jwt": true,
    "FormErrors.InvalidFormat.starts_with": true,
    "FormErrors.InvalidFormat.ends_with": true,
    "FormErrors.InvalidFormat.includes": true,
    "FormErrors.InvalidValue": true,
    "FormErrors.NotMultipleOf": true,
    "FormErrors.UnrecognizedKeys": true,
    "FormErrors.Custom.not-semver": true,
    "FormErrors.Custom.empty-update": true,
    "FormErrors.Custom.end-before-start": true,
    "FormErrors.Custom.duration-too-long": true,
    "FormErrors.Custom.until-before-first-date": true,
    "FormErrors.Custom.primary-category-not-in-list": true,
    "FormErrors.Custom.duplicate-date": true,
    "FormErrors.Custom.date-added-and-removed": true,
    "FormErrors.Custom.range-incomplete": true,
    "FormErrors.Custom.free-with-price": true,
    "FormErrors.Custom.paid-without-price": true,
}

export const formIssueKeys: string[] = Object.keys(formIssueKeyRecord)

/**
 * @description Returns every form issue key the reference language lacks in the namespace
 * @param locales Locales read
 * @param namespace Namespace holding the form error translations
 */
export const findMissingFormIssueKeys = (
    locales: Locales,
    namespace = "ui",
): string[] => {
    const flat = flatOf(locales, referenceLanguage(locales), namespace)
    return formIssueKeys.filter(key => !hasTranslation(flat, key))
}
