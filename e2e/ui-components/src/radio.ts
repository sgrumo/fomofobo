import { expect } from "@playwright/test"

import type { Scope } from "./shared"

const radio = (scope: Scope, itemLabel: string) =>
    scope.getByRole("radio", { name: itemLabel, exact: true })

/**
 * @description Selects the radio item and asserts the checked state
 * @param scope Search root
 * @param itemLabel Accessible label
 */
export const selectRadioItem = async (scope: Scope, itemLabel: string) => {
    const target = radio(scope, itemLabel)
    if ((await target.getAttribute("aria-checked")) !== "true") {
        await target.click()
    }
    await expect(target).toBeChecked()
}

/**
 * @description Asserts the radio item is selected
 * @param scope Search root
 * @param itemLabel Accessible label
 */
export const expectRadioSelected = async (scope: Scope, itemLabel: string) => {
    await expect(radio(scope, itemLabel)).toBeChecked()
}

/**
 * @description Asserts the radio item is not selected
 * @param scope Search root
 * @param itemLabel Accessible label
 */
export const expectRadioNotSelected = async (scope: Scope, itemLabel: string) => {
    await expect(radio(scope, itemLabel)).toHaveAttribute("aria-checked", "false")
}
