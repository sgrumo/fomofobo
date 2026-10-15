import type { LanguageKey } from "i18n/i18n"
import { defaultNS, fallbackLanguage } from "i18n/i18n"
import type { FlatNamespace, i18n as I18nInstance, ResourceLanguage } from "i18next"
import { createInstance } from "i18next"

export const namespaces: FlatNamespace[] = ["shared", "ui", "files"]

/**
 * @description Builds an i18next instance of one language, initialized synchronously
 * @param language Language of the instance
 * @param resources Resources of that language, one entry per namespace
 */
export const createI18nInstance = (
    language: LanguageKey,
    resources: ResourceLanguage,
): I18nInstance => {
    const instance = createInstance({
        lng: language,
        fallbackLng: fallbackLanguage,
        resources: { [language]: resources },
        ns: namespaces,
        defaultNS,
        interpolation: { escapeValue: false },
        initAsync: false,
    })
    void instance.init()
    return instance
}
