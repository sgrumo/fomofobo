import type { RefObject } from "react"
import { useEffect, useEffectEvent } from "react"

/**
 * @description True when the key press belongs to another dialog, which closes on its own
 * @param event Key press read
 * @param dialog Element of the dialog
 */
const isInOtherDialog = (event: KeyboardEvent, dialog: HTMLElement): boolean =>
    event.target instanceof Element &&
    !dialog.contains(event.target) &&
    event.target.closest("[role=dialog]") !== null

/**
 * @description Moves the focus into a non-modal dialog while it shows, gives it back when it goes, and closes it on Escape from anywhere
 * @param dialogRef Element of the dialog
 * @param onClose Closes the dialog
 */
export const useNonModalDialog = (
    dialogRef: RefObject<HTMLElement | null>,
    onClose: () => void,
): void => {
    const close = useEffectEvent(onClose)

    useEffect(() => {
        const dialog = dialogRef.current
        if (dialog === null) {
            return undefined
        }
        const previous = document.activeElement
        // A dialog inside a map marker attaches after this effect
        const focusFrame = requestAnimationFrame(() => {
            dialog.focus()
        })
        const closeOnEscape = (event: KeyboardEvent) => {
            if (
                event.key === "Escape" &&
                !event.defaultPrevented &&
                !isInOtherDialog(event, dialog)
            ) {
                close()
            }
        }
        document.addEventListener("keydown", closeOnEscape)
        return () => {
            cancelAnimationFrame(focusFrame)
            document.removeEventListener("keydown", closeOnEscape)
            requestAnimationFrame(() => {
                // A dialog that opens meanwhile keeps the focus it took
                const focusLost =
                    document.activeElement === null ||
                    document.activeElement === document.body
                if (
                    previous instanceof HTMLElement &&
                    previous.isConnected &&
                    focusLost
                ) {
                    previous.focus()
                }
            })
        }
    }, [dialogRef])
}
