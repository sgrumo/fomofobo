import "i18next"
// TODO import as const once https://github.com/microsoft/TypeScript/issues/32063 closes, to type interpolation keys in `t`.
import type shared from "../../public/locales/it/shared.json"
import type ui from "../../public/locales/it/ui.json"

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: "shared"
        resources: {
            shared: typeof shared
            ui: typeof ui
        }
    }
}
