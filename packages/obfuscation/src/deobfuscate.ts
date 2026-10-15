import { backwardTransformations, composeTransformations } from "./pipeline"

/**
 * @description Returns the plain text behind the obfuscated text
 * @param obfuscatedText Text deobfuscated
 */
export const deobfuscate = (obfuscatedText: string): string =>
    composeTransformations(obfuscatedText.split(""), backwardTransformations).join("")
