import "server-only"
import type { LanguageKey } from "i18n/i18n"
import type { FlatNamespace, ResourceLanguage } from "i18next"

import enFiles from "../../../../public/locales/en/files.json"
import enShared from "../../../../public/locales/en/shared.json"
import enUi from "../../../../public/locales/en/ui.json"
import itFiles from "../../../../public/locales/it/files.json"
import itShared from "../../../../public/locales/it/shared.json"
import itUi from "../../../../public/locales/it/ui.json"

const resources = {
    en: { shared: enShared, ui: enUi, files: enFiles },
    it: { shared: itShared, ui: itUi, files: itFiles },
} satisfies Record<LanguageKey, Record<FlatNamespace, unknown>>

/**
 * @description Returns the resources of one language, one entry per namespace
 * @param language Language read
 */
export const getResources = (language: LanguageKey): ResourceLanguage =>
    resources[language]
