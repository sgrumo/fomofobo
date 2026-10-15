import { expect } from "@playwright/test"

import { t } from "./i18n"
import type { Scope } from "./shared"

const numberInput = (scope: Scope, label: string) =>
    scope.getByLabel(label, { exact: true })

/**
 * @description Returns the group element that wraps the number input
 * @param scope Search root
 * @param label Accessible label
 */
const numberInputGroup = (scope: Scope, label: string) =>
    numberInput(scope, label).locator("xpath=..")

/**
 * @description Fills the number input and blurs it to commit the value
 * @param scope Search root
 * @param label Accessible label
 * @param value Value to fill
 */
export const fillNumberInput = async (scope: Scope, label: string, value: number) => {
    const input = numberInput(scope, label)
    // Selected rather than cleared, and typed rather than filled. A value set at
    // once lands as zero on an input whose owner commits it a render later.
    await input.press("ControlOrMeta+a")
    await input.pressSequentially(String(value))
    await input.blur()
}

/**
 * @description Clicks the increment button of the number input
 * @param scope Search root
 * @param label Accessible label
 */
export const incrementNumberInput = async (scope: Scope, label: string) => {
    await numberInputGroup(scope, label)
        .getByRole("button", { name: t("ui", "NumberInput.Increment"), exact: true })
        .click()
}

/**
 * @description Clicks the decrement button of the number input
 * @param scope Search root
 * @param label Accessible label
 */
export const decrementNumberInput = async (scope: Scope, label: string) => {
    await numberInputGroup(scope, label)
        .getByRole("button", { name: t("ui", "NumberInput.Decrement"), exact: true })
        .click()
}

/**
 * @description Asserts the number input value
 * @param scope Search root
 * @param label Accessible label
 * @param text Expected value text
 */
export const expectNumberInputValue = async (
    scope: Scope,
    label: string,
    text: string,
) => {
    await expect(numberInput(scope, label)).toHaveValue(text)
}
