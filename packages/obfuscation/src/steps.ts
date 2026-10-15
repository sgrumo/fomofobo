import { chunk } from "es-toolkit"
import { fromUint8Array, toUint8Array } from "js-base64"

//#region Models
export type ObfuscationStep =
    | { type: "reverse" }
    | { type: "shifter"; amount: number }
    | { type: "swapper"; perSlice: number; fromEnd: boolean }
    | { type: "base64" }
//#endregion

//#region Reverser
/**
 * @description Returns the characters in reverse order
 * @param chars Characters reversed
 */
export const reverse = (chars: string[]): string[] => chars.toReversed()
//#endregion

//#region Shifter
/**
 * @description Returns an operator raising every code unit by the amount
 * @param amount Code units added
 */
export const shiftForward =
    (amount: number) =>
    (chars: string[]): string[] =>
        // SAFETY: the modulo-65536 wrap needs code-unit semantics; `fromCodePoint`
        // throws on out-of-range values.
        // oxlint-disable-next-line unicorn/prefer-code-point
        chars.map(char => String.fromCharCode(char.charCodeAt(0) + amount))

/**
 * @description Returns an operator lowering every code unit by the amount
 * @param amount Code units removed
 */
export const shiftBackward =
    (amount: number) =>
    (chars: string[]): string[] =>
        // SAFETY: the exact inverse needs code-unit semantics.
        // oxlint-disable-next-line unicorn/prefer-code-point
        chars.map(char => String.fromCharCode(char.charCodeAt(0) - amount))
//#endregion

//#region Swapper
/**
 * @description Returns an operator swapping the two halves of every full slice
 * @param perSlice Length of one half
 * @remarks Leaves a trailing partial slice untouched
 */
const swapHalves =
    (perSlice: number) =>
    (chars: string[]): string[] => {
        const sliceLength = perSlice * 2
        return chunk(chars, sliceLength).flatMap(slice =>
            slice.length === sliceLength
                ? slice.slice(perSlice).concat(slice.slice(0, perSlice))
                : slice,
        )
    }

/**
 * @description Returns an operator swapping slice halves, from the start or the end
 * @param perSlice Length of one half
 * @param fromEnd Flag slicing from the end of the list
 */
export const swap =
    (perSlice: number, fromEnd: boolean) =>
    (chars: string[]): string[] => {
        if (!fromEnd) {
            return swapHalves(perSlice)(chars)
        }

        return swapHalves(perSlice)(chars.toReversed()).toReversed()
    }
//#endregion

//#region Base64
/**
 * @description Maps a character to its high byte and its low byte
 * @param char Character split
 */
const charToBytes = (char: string): [number, number] => {
    // SAFETY: encodes raw UTF-16 code units (0-65535) as two bytes; `codePointAt`
    // merges surrogate pairs into values overflowing a 16-bit slot.
    // oxlint-disable-next-line unicorn/prefer-code-point
    const code = char.charCodeAt(0)
    return [code >> 8, code & 0xff]
}

/**
 * @description Maps a high byte and a low byte to one character
 * @param bytes Byte pair joined
 */
const bytesToChar = ([high = 0, low = 0]: number[]): string =>
    // SAFETY: decodes raw UTF-16 code units (0-65535) from two bytes; `fromCodePoint`
    // rejects the lone surrogates a preceding shift can produce.
    // oxlint-disable-next-line unicorn/prefer-code-point
    String.fromCharCode((high << 8) | low)

/**
 * @description Maps the characters to a two-byte-per-character buffer
 * @param chars Characters encoded
 */
const charsToBytes = (chars: string[]): Uint8Array =>
    Uint8Array.from(chars.flatMap(charToBytes))

/**
 * @description Maps a two-byte-per-character buffer back to characters
 * @param bytes Buffer decoded
 */
const bytesToChars = (bytes: Uint8Array): string[] =>
    chunk([...bytes], 2).map(bytesToChar)

/**
 * @description Maps the characters to the characters of their base64url form
 * @param chars Characters encoded
 */
export const base64Encode = (chars: string[]): string[] =>
    fromUint8Array(charsToBytes(chars), true).split("")

/**
 * @description Maps base64url characters back to the source characters
 * @param chars Characters decoded
 */
export const base64Decode = (chars: string[]): string[] =>
    bytesToChars(toUint8Array(chars.join("")))
//#endregion
