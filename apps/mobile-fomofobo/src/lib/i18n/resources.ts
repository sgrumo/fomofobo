import type { LanguageKey } from "i18n/i18n"
import type { ResourceLanguage } from "i18next"

import itShared from "../../locales/it/shared.json"
import itUi from "../../locales/it/ui.json"
import itVersionGate from "../../locales/it/version-gate.json"

export const resources = {
    it: {
        shared: itShared,
        ui: itUi,
        "version-gate": itVersionGate,
    },
} satisfies Record<LanguageKey, ResourceLanguage>

export const namespaces = Object.keys(resources.it)
