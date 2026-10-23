import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * @description Returns the class values merged into one Tailwind class string
 * @param classes Class values merged
 */
export const cn = (...classes: ClassValue[]) => twMerge(clsx(classes))
/**
 * @description Returns a builder yielding the merged class string for its arguments
 * @template A Argument tuple type
 * @param fn Builder returning the class values
 */
export const styles =
    <A extends unknown[]>(fn: (...args: A) => ClassValue | ClassValue[]) =>
    (...args: A) =>
        cn(fn(...args))
