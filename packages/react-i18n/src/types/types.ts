import type { FlatNamespace } from "i18next"
import type { useTranslation } from "react-i18next"

export type UseTranslation = ReturnType<typeof useTranslation>["t"]
/**
 * @description Returns the translation function type bound to one namespace
 * @template TNs Namespace bound
 */
export type UseNamespacedTranslation<TNs extends FlatNamespace> = ReturnType<
    typeof useTranslation<TNs>
>["t"]
export type TranslationNamespace = Parameters<typeof useTranslation>[0]
