import { toast as burntToast } from "burnt"

import { TOAST_DURATION, ToastHaptic, ToastPreset } from "./toast.styles"

type ToastPresetKey = "Success" | "Error" | "Info"

interface ToastOptions {
    title: string
    message?: string
    preset?: ToastPresetKey
    duration?: number
}

/**
 * @description Shows a native toast with the preset matching the options
 * @param options Title, message, preset, and duration of the toast
 */
const toast = (options: ToastOptions) => {
    const preset = options.preset ?? "Info"
    burntToast({
        title: options.title,
        message: options.message,
        preset: ToastPreset[preset],
        haptic: ToastHaptic[preset],
        duration: options.duration ?? TOAST_DURATION,
    })
}

const toastSuccess = (title: string, message?: string) => {
    toast({ title, message, preset: "Success" })
}

const toastError = (title: string, message?: string) => {
    toast({ title, message, preset: "Error" })
}

export { toast, toastError, toastSuccess }
