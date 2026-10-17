import { useEffect, useState } from "react"

/**
 * @description Returns the current instant, refreshed on every tick
 * @param tickMs Milliseconds between two refreshes
 */
export const useNow = (tickMs: number): Date => {
    const [now, setNow] = useState(() => new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date())
        }, tickMs)
        return () => {
            clearInterval(timer)
        }
    }, [tickMs])

    return now
}
