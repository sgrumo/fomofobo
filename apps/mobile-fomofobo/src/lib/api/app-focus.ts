import { focusManager } from "@tanstack/react-query"
import { AppState } from "react-native"

/**
 * @remarks TanStack Query watches window focus, which React Native has no notion
 * of. This maps the `active` state of the app onto it, so every query with
 * `refetchOnWindowFocus` runs again when the user returns to the app. `AppState`
 * also emits `inactive` and `background`, and neither counts as focus
 */
focusManager.setEventListener(handleFocus => {
    const subscription = AppState.addEventListener("change", state => {
        handleFocus(state === "active")
    })

    return () => {
        subscription.remove()
    }
})
