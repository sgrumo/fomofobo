import type { SyntheticEvent } from "react"

/**
 * @description Keeps an event inside the element that took it
 * @param event Event contained
 * @remarks For a control nested in another control, which would act on the same event
 */
export const containEvent = (event: SyntheticEvent): void => {
    event.preventDefault()
    event.stopPropagation()
}
