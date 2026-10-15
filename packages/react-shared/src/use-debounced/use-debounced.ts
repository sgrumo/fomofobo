import { noop } from "es-toolkit"
import { useEffect, useEffectEvent, useState } from "react"
import type { Primitive } from "shared/types"

/**
 * @description Returns the debounced value, the pending flag, and the live value
 * @template T Value type
 * @param value Value debounced, or a factory yielding it
 * @param by Selector reducing the value to a comparable key
 * @param delay Delay in milliseconds, `next-tick`, or `none`
 */
export const useDebounced = <T>(
    value: T | (() => T),
    by: (value: T) => Primitive,
    delay: number | "next-tick" | "none" = 500,
): [T, boolean, T] => {
    const normalizedValue = value instanceof Function ? value() : value

    const [debounced, setDebounced] = useState<T>(normalizedValue)
    const valueKey = by(normalizedValue)
    const debouncedKey = by(debounced)
    const debouncing = valueKey !== debouncedKey

    const setDebouncedToCurrent = useEffectEvent(() => {
        setDebounced(normalizedValue)
    })

    useEffect(() => {
        if (valueKey === debouncedKey || delay === "none") {
            return noop
        }

        const timeout = setTimeout(
            () => {
                setDebouncedToCurrent()
            },
            delay === "next-tick" ? undefined : delay,
        )

        return () => {
            clearTimeout(timeout)
        }
    }, [valueKey, debouncedKey, delay])

    return delay === "none"
        ? [normalizedValue, false, normalizedValue]
        : [debounced, debouncing, normalizedValue]
}
