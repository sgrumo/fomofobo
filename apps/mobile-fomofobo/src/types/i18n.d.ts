import "i18next"
import type { defaultNS } from "i18n/i18n"

// TODO import as const once https://github.com/microsoft/TypeScript/issues/32063 closes, to type interpolation keys in `t`.
import type { resources } from "../lib/i18n/resources"

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: typeof defaultNS
        resources: (typeof resources)["it"]
    }
}
