import { AccessibilityInfo } from "react-native"

import type { ToastTone } from "./toast-store"
import { showToast } from "./toast-store"
import { TOAST_DURATION_MS } from "./toast.styles"

interface ToastOptions {
    title: string
    message?: string
    tone?: ToastTone
    durationMs?: number
}

/**
 * @description Shows an in-app toast in the tone of a notice and announces it to the screen reader
 * @param options Copy, tone and time on screen of the toast
 */
const toast = (options: ToastOptions) => {
    showToast(
        { tone: options.tone ?? "info", title: options.title, message: options.message },
        options.durationMs ?? TOAST_DURATION_MS,
    )
    AccessibilityInfo.announceForAccessibility(
        [options.title, options.message].filter(line => line !== undefined).join(". "),
    )
}

const toastSuccess = (title: string, message?: string) => {
    toast({ title, message, tone: "success" })
}

const toastError = (title: string, message?: string) => {
    toast({ title, message, tone: "error" })
}

export { toast, toastError, toastSuccess }
