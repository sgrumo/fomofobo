import type { LanguageKey } from "i18n/i18n"

/**
 * @description Returns the pathname with its first segment, the language, replaced
 * @param pathname Pathname of a page of this app, `[lang]` first
 * @param language Language put in the first segment
 */
export const replaceLanguage = (pathname: string, language: LanguageKey): string => {
    const rest = pathname.split("/").slice(2)
    return `/${[language, ...rest].join("/")}`
}
