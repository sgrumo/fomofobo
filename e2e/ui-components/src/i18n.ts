import path from "node:path"

import { createI18n } from "e2e-kit/i18n"

// The `ui` namespace comes from `ui-components`, the same in every app, so the helpers
// read their own generated copy and never the locales of one app.
export const { t } = createI18n(path.resolve(import.meta.dirname, "locales"))
