import { expect } from "@playwright/test"

import type { Scope } from "./shared"

const input = (scope: Scope, label: string) => scope.getByLabel(label, { exact: true })

/**
 * @description Fills a labeled textbox (Input, StringInput, Textarea, TimeInput)
 * @param scope Search root
 * @param label Accessible label
 * @param value Value to fill
 */
export const fillInput = async (scope: Scope, label: string, value: string) => {
    await input(scope, label).fill(value)
}

/**
 * @description Clears a labeled textbox
 * @param scope Search root
 * @param label Accessible label
 */
export const clearInput = async (scope: Scope, label: string) => {
    await input(scope, label).clear()
}

/**
 * @description Asserts the input value
 * @param scope Search root
 * @param label Accessible label
 * @param value Expected value
 */
export const expectInputValue = async (scope: Scope, label: string, value: string) => {
    await expect(input(scope, label)).toHaveValue(value)
}

/**
 * @description Asserts the input is disabled
 * @param scope Search root
 * @param label Accessible label
 */
export const expectInputDisabled = async (scope: Scope, label: string) => {
    await expect(input(scope, label)).toBeDisabled()
}

/**
 * @description Fills a textbox by its placeholder
 * @param scope Search root
 * @param placeholder Placeholder text
 * @param value Value to fill
 */
export const fillInputByPlaceholder = async (
    scope: Scope,
    placeholder: string,
    value: string,
) => {
    await scope.getByPlaceholder(placeholder, { exact: true }).fill(value)
}

/**
 * @description Clears a textbox found by its placeholder
 * @param scope Search root
 * @param placeholder Placeholder text
 */
export const clearInputByPlaceholder = async (scope: Scope, placeholder: string) => {
    await scope.getByPlaceholder(placeholder, { exact: true }).clear()
}

/**
 * @description Asserts the value of a textbox found by its placeholder
 * @param scope Search root
 * @param placeholder Placeholder text
 * @param value Expected value
 */
export const expectInputValueByPlaceholder = async (
    scope: Scope,
    placeholder: string,
    value: string,
) => {
    await expect(scope.getByPlaceholder(placeholder, { exact: true })).toHaveValue(value)
}
