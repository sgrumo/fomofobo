import type { ToastObject } from "@base-ui/react"
import { Toast as ToastPrimitive } from "@base-ui/react"
import type { Require } from "shared/types"

import { useUiContext } from "../i18n/ui-context"
import {
    plainToastToNewToast,
    toastInputToToastData,
    toastDataSchema,
} from "./toast.helper"
import type { ToastData, ToastInput, ToastType } from "./toast.helper"

/**
 * @description Returns the toast controls bound to the UI context translate function
 * @remarks Drops every queued toast with data failing `toastDataSchema`
 */
export const useToast = () => {
    const { i18n } = useUiContext()
    const base = ToastPrimitive.useToastManager()

    const list = base.toasts.flatMap<Require<ToastObject<ToastData>, "data">>(
        (toast: ToastObject<object>) => {
            const parsed = toastDataSchema.safeParse(toast.data)
            if (!parsed.success) {
                return []
            }
            return { ...toast, data: parsed.data }
        },
    )

    const add = (input: ToastInput) =>
        base.add({ data: toastInputToToastData(input, i18n.t) })

    return {
        add,
        addPlain: (type: ToastType, message: string) =>
            add(plainToastToNewToast(type, message)),
        close: (id?: string) => {
            base.close(id)
        },
        list,
    }
}
