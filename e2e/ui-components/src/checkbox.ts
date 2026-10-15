import { expect } from "@playwright/test"

import type { Scope } from "./shared"

const checkbox = (scope: Scope, label: string) =>
    scope.getByRole("checkbox", { name: label, exact: true })

/**
 * @description Checks the checkbox and asserts the checked state
 * @param scope Search root
 * @param label Accessible label
 */
export const checkCheckbox = async (scope: Scope, label: string) => {
    const target = checkbox(scope, label)
    if (!(await target.isChecked())) {
        await target.click()
    }
    await expect(target).toBeChecked()
}

/**
 * @description Unchecks the checkbox and asserts the unchecked state
 * @param scope Search root
 * @param label Accessible label
 */
export const uncheckCheckbox = async (scope: Scope, label: string) => {
    const target = checkbox(scope, label)
    if (await target.isChecked()) {
        await target.click()
    }
    await expect(target).toBeChecked({ checked: false })
}

/**
 * @description Asserts the checkbox is checked
 * @param scope Search root
 * @param label Accessible label
 */
export const expectCheckboxChecked = async (scope: Scope, label: string) => {
    await expect(checkbox(scope, label)).toBeChecked()
}

/**
 * @description Asserts the checkbox is unchecked
 * @param scope Search root
 * @param label Accessible label
 */
export const expectCheckboxUnchecked = async (scope: Scope, label: string) => {
    await expect(checkbox(scope, label)).toBeChecked({ checked: false })
}

/**
 * @description Asserts the checkbox is indeterminate
 * @param scope Search root
 * @param label Accessible label
 */
export const expectCheckboxIndeterminate = async (scope: Scope, label: string) => {
    await expect(checkbox(scope, label)).toHaveAttribute("aria-checked", "mixed")
}
