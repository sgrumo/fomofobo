/**
 * @description Returns a change handler passing the event target value to the callback
 * @param callback Receiver of the target value
 */
export const handler =
    (callback: (value: string) => void) => (event: { target: { value: string } }) => {
        callback(event.target.value)
    }

/**
 * @description Returns a submit handler blocking the default action before the callback
 * @param callback Action run after the default action is blocked
 */
export const formHandler =
    (callback: () => void) => (event: { preventDefault: () => void }) => {
        event.preventDefault()
        callback()
    }
