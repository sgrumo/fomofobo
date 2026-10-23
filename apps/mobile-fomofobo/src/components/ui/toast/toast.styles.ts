/**
 * @remarks Holds seconds, the unit `burnt` expects, not milliseconds
 */
export const TOAST_DURATION = 2

export const ToastPreset = {
    Success: "done",
    Error: "error",
    Info: "none",
} as const

export const ToastHaptic = {
    Success: "success",
    Error: "error",
    Info: "none",
} as const
