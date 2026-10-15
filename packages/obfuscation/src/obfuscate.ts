import { composeTransformations, forwardTransformations } from "./pipeline"

/**
 * @description Returns the obfuscated form of the text
 * @param plainText Text obfuscated
 * @remarks Hides the text without any crypto, so it protects nothing
 */
export const obfuscate = (plainText: string): string =>
    composeTransformations(plainText.split(""), forwardTransformations).join("")
