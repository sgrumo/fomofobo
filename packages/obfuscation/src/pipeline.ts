import { match } from "ts-pattern"

import {
    base64Decode,
    base64Encode,
    reverse,
    shiftBackward,
    shiftForward,
    swap,
} from "./steps"
import type { ObfuscationStep } from "./steps"

/**
 * @remarks Editing the recipe breaks every value obfuscated with the old one
 */
export const obfuscationRecipe: ObfuscationStep[] = [
    { type: "reverse" },
    { type: "swapper", perSlice: 3, fromEnd: false },
    { type: "swapper", perSlice: 7, fromEnd: true },
    { type: "shifter", amount: 47 },
    { type: "reverse" },
    { type: "swapper", perSlice: 5, fromEnd: false },
    { type: "shifter", amount: 113 },
    { type: "swapper", perSlice: 2, fromEnd: true },
    { type: "shifter", amount: 29 },
    { type: "reverse" },
    { type: "shifter", amount: 71 },
    { type: "base64" },
    { type: "swapper", perSlice: 9, fromEnd: false },
    { type: "reverse" },
    { type: "swapper", perSlice: 4, fromEnd: true },
    { type: "swapper", perSlice: 6, fromEnd: false },
    { type: "reverse" },
    { type: "swapper", perSlice: 8, fromEnd: true },
    { type: "reverse" },
    { type: "swapper", perSlice: 3, fromEnd: true },
    { type: "swapper", perSlice: 5, fromEnd: false },
    { type: "reverse" },
]

/**
 * @description Maps a step to its forward transformation
 * @param step Step read
 */
const toForwardTransformation = (step: ObfuscationStep) =>
    match(step)
        .with({ type: "reverse" }, () => reverse)
        .with({ type: "shifter" }, ({ amount }) => shiftForward(amount))
        .with({ type: "swapper" }, ({ perSlice, fromEnd }) => swap(perSlice, fromEnd))
        .with({ type: "base64" }, () => base64Encode)
        .exhaustive()

/**
 * @description Maps a step to the transformation undoing it
 * @param step Step read
 */
const toBackwardTransformation = (step: ObfuscationStep) =>
    match(step)
        .with({ type: "reverse" }, () => reverse)
        .with({ type: "shifter" }, ({ amount }) => shiftBackward(amount))
        .with({ type: "swapper" }, ({ perSlice, fromEnd }) => swap(perSlice, fromEnd))
        .with({ type: "base64" }, () => base64Decode)
        .exhaustive()

export const forwardTransformations = obfuscationRecipe.map(toForwardTransformation)

export const backwardTransformations = obfuscationRecipe
    .toReversed()
    .map(toBackwardTransformation)

/**
 * @description Returns the characters after every transformation runs in order
 * @param input Characters fed to the first transformation
 * @param transformations Transformations run in list order
 */
export const composeTransformations = (
    input: string[],
    transformations: Array<(chars: string[]) => string[]>,
): string[] => transformations.reduce((current, transform) => transform(current), input)
