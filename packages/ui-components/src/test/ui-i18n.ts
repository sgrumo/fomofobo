import { enUS } from "date-fns/locale"
import { isDefined } from "shared/values"

import type { UiTranslate } from "../i18n/ui-translations"

/**
 * @description Returns the key with every interpolation appended as `-name:value`
 * @param key Translation key
 * @param params Interpolation values
 */
export const testT: UiTranslate = (key, params) =>
    isDefined(params)
        ? Object.entries(params).reduce<string>(
              (acc, [paramKey, paramValue]) => `${acc}-${paramKey}:${paramValue}`,
              key,
          )
        : key

export const testLocale = enUS
