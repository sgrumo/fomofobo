import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"

import type { Scope } from "./shared"

/**
 * @description Returns the chip locator
 * @param scope Search root
 * @param name Accessible name: the label, then the count when the chip shows one
 */
export const getChip = (scope: Scope, name: string): Locator =>
    scope.getByRole("button", { name, exact: true })

/**
 * @description Returns the chip row locator
 * @param scope Search root
 * @param label Accessible label of the row
 */
export const getChipRow = (scope: Scope, label: string): Locator =>
    scope.getByRole("group", { name: label, exact: true })

/**
 * @description Returns the chip bar locator
 * @param scope Search root
 * @param label Accessible label of the bar
 */
export const getChipBar = (scope: Scope, label: string): Locator =>
    scope.getByRole("group", { name: label, exact: true })

/**
 * @description Presses the chip and waits until it reads pressed
 * @param scope Search root
 * @param name Accessible name
 */
export const pressChip = async (scope: Scope, name: string) => {
    const chip = getChip(scope, name)
    await expect(chip).toHaveAttribute("aria-pressed", "false")
    await chip.click()
    await expect(chip).toHaveAttribute("aria-pressed", "true")
}

/**
 * @description Unpresses the chip and waits until it reads not pressed
 * @param scope Search root
 * @param name Accessible name
 */
export const unpressChip = async (scope: Scope, name: string) => {
    const chip = getChip(scope, name)
    await expect(chip).toHaveAttribute("aria-pressed", "true")
    await chip.click()
    await expect(chip).toHaveAttribute("aria-pressed", "false")
}

/**
 * @description Asserts the chip is pressed
 * @param scope Search root
 * @param name Accessible name
 */
export const expectChipPressed = async (scope: Scope, name: string) => {
    await expect(getChip(scope, name)).toHaveAttribute("aria-pressed", "true")
}

/**
 * @description Asserts the chip is not pressed
 * @param scope Search root
 * @param name Accessible name
 */
export const expectChipNotPressed = async (scope: Scope, name: string) => {
    await expect(getChip(scope, name)).toHaveAttribute("aria-pressed", "false")
}
