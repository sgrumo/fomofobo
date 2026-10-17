const MINUTE_MS = 60_000

export interface CountdownParts {
    hours: number
    minutes: number
}

/**
 * @description Returns the whole hours and minutes of a span, minutes rounded up so a
 * running countdown never reads zero before its end
 * @param spanMs Span in milliseconds
 */
export const countdownParts = (spanMs: number): CountdownParts => {
    const totalMinutes = Math.ceil(Math.max(0, spanMs) / MINUTE_MS)
    return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 }
}
