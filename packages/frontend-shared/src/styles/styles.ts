import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import type { Properties } from "csstype"
import { extendTailwindMerge } from "tailwind-merge"

type CSSProperties = Properties<string | number>

/**
 * @description Merges class lists, aware of the hard shadows and the typography utilities of `packages/styles`
 * @remarks Mirrors the `--shadow-*` tokens and the `tp-*` utilities of `packages/styles`, so a new one there needs an entry here
 */
const twMerge = extendTailwindMerge<"typography">({
    extend: {
        theme: {
            shadow: ["hard-sm", "hard-md", "hard-lg"],
        },
        classGroups: {
            typography: [
                {
                    tp: [
                        "pixel-2xl",
                        "pixel-xl",
                        "pixel-lg",
                        "pixel-md",
                        "pixel-sm",
                        "body-lg",
                        "body-md",
                        "body-sm",
                    ],
                },
            ],
        },
    },
})

/**
 * @description Returns the class list with conflicting Tailwind classes resolved
 * @param classes Class values merged
 */
export const cn = (...classes: ClassValue[]): string => twMerge(clsx(classes))

/**
 * @description Returns a wrapper yielding a merged class list
 * @template A Argument tuple type
 * @param fn Builder yielding the raw class values
 */
export const styles =
    <A extends unknown[]>(
        fn: (...args: A) => ClassValue | ClassValue[],
    ): ((...args: A) => string) =>
    (...args: A) =>
        cn(fn(...args))

/**
 * @description Returns a wrapper yielding a merged class list and inline styles
 * @template A Argument tuple type
 * @param fn Builder yielding the raw class values and the inline styles
 */
export const fullStyles =
    <A extends unknown[]>(
        fn: (...args: A) => {
            className: ClassValue | ClassValue[]
            style: CSSProperties
        },
    ): ((...args: A) => { className: string; style: CSSProperties }) =>
    (...args: A) => {
        const computed = fn(...args)
        return {
            className: cn(computed.className),
            style: computed.style,
        }
    }
