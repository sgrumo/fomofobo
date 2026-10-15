import { expect } from "@playwright/test"

import type { Scope } from "./shared"

const switchControl = (scope: Scope, label: string) =>
    scope.getByRole("switch", { name: label, exact: true })

/**
 * @description Turns the switch on and asserts the checked state
 * @param scope Search root
 * @param label Accessible label
 */
export const switchOn = async (scope: Scope, label: string) => {
    const target = switchControl(scope, label)
    if ((await target.getAttribute("aria-checked")) !== "true") {
        await target.click()
    }
    await expect(target).toBeChecked()
}

/**
 * @description Turns the switch off and asserts the unchecked state
 * @param scope Search root
 * @param label Accessible label
 */
export const switchOff = async (scope: Scope, label: string) => {
    const target = switchControl(scope, label)
    if ((await target.getAttribute("aria-checked")) === "true") {
        await target.click()
    }
    await expect(target).toHaveAttribute("aria-checked", "false")
}

/**
 * @description Asserts the switch is on
 * @param scope Search root
 * @param label Accessible label
 */
export const expectSwitchOn = async (scope: Scope, label: string) => {
    await expect(switchControl(scope, label)).toBeChecked()
}

/**
 * @description Asserts the switch is off
 * @param scope Search root
 * @param label Accessible label
 */
export const expectSwitchOff = async (scope: Scope, label: string) => {
    await expect(switchControl(scope, label)).toHaveAttribute("aria-checked", "false")
}
