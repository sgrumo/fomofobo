import { bindZodLocale, defaultLanguage, defaultNS, languageKeys } from "i18n/i18n"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { runOnce } from "shared/function"

import { namespaces, resources } from "./resources"

export const nativeI18n = {
    init: runOnce(async setRun => {
        await i18n.use(initReactI18next).init({
            resources,
            lng: defaultLanguage,
            supportedLngs: languageKeys,
            fallbackLng: defaultLanguage,
            ns: namespaces,
            defaultNS,
            interpolation: {
                escapeValue: false,
            },
        })

        bindZodLocale(i18n)
        setRun()
    }),
}
