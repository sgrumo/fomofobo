import { useSyncExternalStore } from "react"

interface InstallPromptEvent extends Event {
    prompt: () => Promise<unknown>
}

const listeners = new Set<() => void>()
// The browser fires the event once per page load, often before the screen that offers the install opens.
let pending: InstallPromptEvent | undefined = undefined

/**
 * @description True when the event is the `beforeinstallprompt` of a Chromium browser
 * @param event Event received
 */
const isInstallPromptEvent = (event: Event): event is InstallPromptEvent =>
    "prompt" in event && typeof event.prompt === "function"

/**
 * @description Stores the pending install prompt in the module store and notifies the subscribers
 * @param event Prompt kept, or undefined once used or the app installed
 */
const setPending = (event: InstallPromptEvent | undefined) => {
    pending = event
    for (const listener of listeners) {
        listener()
    }
}

/**
 * @description Starts keeping the install prompt of the browser for the install entry
 * @remarks Runs once, from the layout of the public app, so the event of the first page is kept
 */
export const listenForInstallPrompt = () => {
    globalThis.addEventListener("beforeinstallprompt", event => {
        if (isInstallPromptEvent(event)) {
            event.preventDefault()
            setPending(event)
        }
    })
    globalThis.addEventListener("appinstalled", () => {
        setPending(undefined)
    })
}

/**
 * @description Shows the install prompt of the browser, once
 * @param event Prompt kept by `listenForInstallPrompt`
 */
export const showInstallPrompt = async (event: InstallPromptEvent): Promise<void> => {
    setPending(undefined)
    await event.prompt()
}

/**
 * @description Returns the install prompt the browser offered, undefined where it offers none
 */
export const useInstallPrompt = (): InstallPromptEvent | undefined =>
    useSyncExternalStore(
        listener => {
            listeners.add(listener)
            return () => {
                listeners.delete(listener)
            }
        },
        () => pending,
        () => undefined,
    )
