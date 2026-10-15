import type { ToastManager } from "@base-ui/react"
import type { Locale } from "date-fns/locale"
import type { ReactNode } from "react"

import { UiContext } from "../i18n/ui-context"
import type { UiTranslate } from "../i18n/ui-translations"
import { ToastProvider } from "../toast/toast"
import { TooltipProvider } from "../tooltip/tooltip"

interface UiProviderProps {
    i18n: { t: UiTranslate; dateFns: { locale: Locale } }
    isDev: boolean
    toastManager: ToastManager
    children?: ReactNode
}

export const UiProvider = (props: UiProviderProps) => (
    <UiContext
        value={{
            i18n: props.i18n,
            isDev: props.isDev,
        }}
    >
        <TooltipProvider>
            <ToastProvider toastManager={props.toastManager}>
                {props.children}
            </ToastProvider>
        </TooltipProvider>
    </UiContext>
)
