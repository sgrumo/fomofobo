import { enUS, it } from "date-fns/locale"
import type { Locale } from "date-fns/locale"
import { pipe } from "es-toolkit/fp"
import type { LanguageKey } from "i18n/i18n"
import { defaultLanguage, languageKeySchema } from "i18n/i18n"
import { useTranslation } from "react-i18next"
import { Result } from "shared/result"

/**
 * @description Returns the active i18n language
 * @remarks Falls back to the default language for an unknown language
 */
export const useLanguage = (): LanguageKey => {
    const { i18n } = useTranslation("shared")
    return pipe(
        Result.try(() => languageKeySchema.parse(i18n.language)),
        Result.unwrapOr(defaultLanguage),
    )
}

const dateFnsLocales: Record<LanguageKey, Locale> = {
    en: enUS,
    it,
}

/**
 * @description Returns the date-fns locale of the active i18n language
 */
export const useDateFnsLocale = (): Locale => dateFnsLocales[useLanguage()]
