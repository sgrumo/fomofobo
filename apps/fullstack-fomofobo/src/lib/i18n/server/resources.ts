import "server-only"
import type { LanguageKey } from "i18n/i18n"
import type { FlatNamespace, ResourceLanguage } from "i18next"

import itShared from "../../../../public/locales/it/shared.json"
import itUi from "../../../../public/locales/it/ui.json"

const resources = {
    it: { shared: itShared, ui: itUi },
} satisfies Record<LanguageKey, Record<FlatNamespace, unknown>>

/**
 * @description Returns the resources of one language, one entry per namespace
 * @param language Language read
 */
export const getResources = (language: LanguageKey): ResourceLanguage =>
    resources[language]
