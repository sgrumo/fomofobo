import type { StrictExclude, StrictOmit } from "shared/types"

import type { NoticeTone } from "@/components/ui/notice/notice"

export type ToastTone = StrictExclude<NoticeTone, "loading">

interface ToastItem {
    id: number
    tone: ToastTone
    title: string
    message?: string
}

const listeners = new Set<() => void>()

interface ToastState {
    toasts: readonly ToastItem[]
    nextId: number
}

const store: ToastState = {
    toasts: [],
    nextId: 0,
}

/**
 * @description Replaces the list of shown toasts and notifies the subscribers
 * @param toasts Toasts shown, oldest first
 */
const setToasts = (toasts: readonly ToastItem[]) => {
    store.toasts = toasts
    for (const listener of listeners) {
        listener()
    }
}

/**
 * @description Registers a listener of the toast list, for `useSyncExternalStore`
 * @param listener Callback run on every change
 */
export const subscribeToasts = (listener: () => void) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

/**
 * @description Returns the toasts shown, oldest first
 */
export const readToasts = () => store.toasts

/**
 * @description Removes a toast from the list
 * @param id Toast removed
 */
export const dismissToast = (id: number) => {
    setToasts(store.toasts.filter(toast => toast.id !== id))
}

/**
 * @description Adds a toast and removes it after its duration
 * @param toast Tone and copy of the toast
 * @param durationMs Time on screen
 */
export const showToast = (toast: StrictOmit<ToastItem, "id">, durationMs: number) => {
    const id = store.nextId
    store.nextId += 1
    setToasts([...store.toasts, { ...toast, id }])
    setTimeout(() => {
        dismissToast(id)
    }, durationMs)
}
