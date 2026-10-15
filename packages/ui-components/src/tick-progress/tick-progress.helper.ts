import { clamp } from "es-toolkit"

export type TickProgressTone = "ink" | "live"

/**
 * @description Returns the filled fraction of the range, clamped to 0..1
 * @param value Current value
 * @param min Range start
 * @param max Range end
 * @remarks Returns 0 for an empty or inverted range
 */
export const tickProgressFraction = (value: number, min: number, max: number): number =>
    max > min && Number.isFinite(value) ? clamp((value - min) / (max - min), 0, 1) : 0
