import type { ForwardedRef, Ref, RefCallback } from "react"

/**
 * @description Returns the cleanup type of a ref callback
 * @template T Element type
 */
type RefCleanup<T> = ReturnType<RefCallback<T>>

/**
 * @description Returns a ref callback assigning the element to every ref
 * @template T Element type
 * @param refs Object refs and callback refs receiving the element
 * @remarks Yields the cleanup detaching every ref
 */
export const combineRefs =
    <T extends HTMLElement>(
        ...refs: Array<Ref<T> | ForwardedRef<T> | undefined | null>
    ): ((element: T | null) => () => void) =>
    (element: T | null) => {
        const cleanupFunctions: Array<RefCleanup<T>> = []

        for (const ref of refs) {
            if (ref === null || ref === undefined) {
                continue
            }

            if (typeof ref === "function") {
                const cleanup = ref(element)

                cleanupFunctions.push(cleanup)
            } else if (typeof ref === "object") {
                ref.current = element

                cleanupFunctions.push(() => {
                    ref.current = null
                })
            }
        }

        return () => {
            for (const cleanup of cleanupFunctions) {
                if (typeof cleanup === "function") {
                    cleanup()
                }
            }
        }
    }
