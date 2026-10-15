import type { Locale } from "date-fns"
import { it } from "date-fns/locale"
import { identity } from "es-toolkit"
import { createContext, useContext } from "react"

import type { UiTranslate } from "./ui-translations"

export interface UiContextValue {
    i18n: { t: UiTranslate; dateFns: { locale: Locale } }
    isDev: boolean
}

/**
 * @remarks Holds a pass-through translate function, so an unwrapped tree shows raw keys
 */
export const UiContext = createContext<UiContextValue>({
    i18n: { t: identity, dateFns: { locale: it } },
    isDev: false,
})

export const useUiContext = (): UiContextValue => useContext(UiContext)
