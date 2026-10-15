import "server-only"
import type { LanguageKey } from "i18n/i18n"
import { defaultNS } from "i18n/i18n"
import type { FlatNamespace, i18n as I18nInstance } from "i18next"
import type { UseNamespacedTranslation } from "react-i18n/types"

import { createI18nInstance } from "../instance"
import { getResources } from "./resources"

const instances = new Map<LanguageKey, I18nInstance>()

/**
 * @description Returns the translation function of the language, bound to the namespace
 * @template TNamespace Namespace bound
 * @param language Language translated to
 * @param namespace Namespace of the keys
 * @remarks Holds one instance per language for the life of the process
 */
export const getNamespacedTranslation = <TNamespace extends FlatNamespace>(
    language: LanguageKey,
    namespace: TNamespace,
): UseNamespacedTranslation<TNamespace> => {
    const instance =
        instances.get(language) ?? createI18nInstance(language, getResources(language))
    instances.set(language, instance)
    return instance.getFixedT(language, namespace)
}

/**
 * @description Returns the `shared` translation function of the language
 * @param language Language translated to
 */
export const getTranslation = (
    language: LanguageKey,
): UseNamespacedTranslation<"shared"> => getNamespacedTranslation(language, defaultNS)
