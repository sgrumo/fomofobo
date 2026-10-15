import { createFormErrorMap, parseFormStateWith } from "frontend-shared/forms"
import type { FormErrorTranslator } from "frontend-shared/types"
import { unsafeT } from "i18n/i18n"
import type { i18n as I18nInstance } from "i18next"

/**
 * @description Returns the `ui` namespace translator over the i18next instance of the tree
 * @param i18n Instance `useTranslation()` hands the component, one per document
 */
const formErrorTranslator = (i18n: I18nInstance): FormErrorTranslator => ({
    exists: (key, params) => i18n.exists(key, { ns: "ui", ...params }),
    translate: (key, params) => unsafeT(i18n.getFixedT(null, "ui"), key, params),
})

export const parseFormState = parseFormStateWith((i18n: I18nInstance) =>
    createFormErrorMap(formErrorTranslator(i18n)),
)
