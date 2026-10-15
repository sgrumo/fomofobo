import type { NamespacedI18nKey } from "i18n/i18n"
import type { UseNamespacedTranslation } from "react-i18n/types"
import { enforceType, isDefined } from "shared/values"
import type { UiTranslate } from "ui-components/i18n"

/**
 * @description Returns a `UiTranslate` adapter over the namespaced translation function
 * @param t Translation function of the `ui` namespace
 * @remarks Returns the key itself when an interpolated lookup yields a non-string
 */
export const createUiTranslate =
    (t: UseNamespacedTranslation<"ui">): UiTranslate =>
    (key, params): string => {
        if (!isDefined(params)) {
            return t(enforceType<NamespacedI18nKey<"ui"> & string>(key))
        }

        const fallback = key
        const translation = t(
            enforceType<NamespacedI18nKey<"ui"> & string>(key),
            fallback,
            params,
        )
        return typeof translation === "string" ? translation : fallback
    }
