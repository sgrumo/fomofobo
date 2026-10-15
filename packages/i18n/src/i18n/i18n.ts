import type {
    FlatNamespace,
    i18n as I18nInstance,
    TFunction,
    TFunctionStrict,
} from "i18next"
import { Result } from "shared/result"
import { z } from "zod"

export const languageKeys = ["en", "it"] as const
export const languageKeySchema = z.enum(languageKeys)
export type LanguageKey = z.infer<typeof languageKeySchema>

export const defaultLanguage: LanguageKey = "en"
export const fallbackLanguage: LanguageKey = defaultLanguage
export const defaultNS = "shared"

const zodLocales: Record<LanguageKey, () => Partial<z.core.$ZodConfig>> = {
    en: z.locales.en,
    it: z.locales.it,
}

/**
 * @description Sets the Zod locale of the language, so untranslated issues follow the app language
 * @param language Language reported by i18next
 * @remarks Falls back to the fallback language locale for an unknown language
 */
export const applyZodLocale = (language: string): void => {
    const parsed = languageKeySchema.safeParse(language)
    z.config(zodLocales[parsed.success ? parsed.data : fallbackLanguage]())
}

/**
 * @description Applies the Zod locale of the instance language, and follows its language changes
 * @param instance i18next instance bound
 */
export const bindZodLocale = (instance: I18nInstance): void => {
    applyZodLocale(instance.language)
    // A hot reload runs the binding again, so drop the listener of the earlier run first
    instance.off("languageChanged", applyZodLocale)
    instance.on("languageChanged", applyZodLocale)
}

export type I18nArity = "Singular" | "Plural"
/**
 * @description Returns the arity matching the count
 * @param count Item count read
 */
export const i18nArity = (count: number): I18nArity =>
    count === 1 || count === -1 ? "Singular" : "Plural"

/**
 * @description Returns the translation of an untyped key
 * @template TNs Namespace bound to the translation function
 * @param t Translation function used
 * @param key Untyped translation key
 * @param params Interpolation values, `count` included
 * @remarks Logs the failure and returns `UnknownTranslation` when the lookup fails
 */
export const unsafeT = <TNs extends FlatNamespace>(
    t: TFunction<TNs>,
    key: string,
    params?: Record<string, unknown>,
): string => {
    const translation = Result.try((): unknown =>
        // SAFETY: the assertion is inside a `Result.try`
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        t(key as never, params),
    )

    if (!translation.success || typeof translation.value !== "string") {
        console.error("translation failure:", translation)
        return "UnknownTranslation"
    }

    return translation.value
}

/**
 * @description Returns the translation key type of one namespace
 * @template TNs Namespace read
 */
export type NamespacedI18nKey<TNs extends FlatNamespace> = Parameters<
    TFunctionStrict<TNs>
>[0]
