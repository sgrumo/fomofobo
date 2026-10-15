import { expect } from "@playwright/test"

import type { Scope } from "./shared"

const button = (scope: Scope, name: string) =>
    scope.getByRole("button", { name, exact: true })

/**
 * @description Clicks a button by its accessible name (text or aria-label)
 * @param scope Search root
 * @param name Accessible name
 */
export const clickButton = async (scope: Scope, name: string) => {
    await button(scope, name).click()
}

/**
 * @description Asserts the button is enabled
 * @param scope Search root
 * @param name Accessible name
 */
export const expectButtonEnabled = async (scope: Scope, name: string) => {
    await expect(button(scope, name)).toBeEnabled()
}

/**
 * @description Asserts the button is disabled
 * @param scope Search root
 * @param name Accessible name
 */
export const expectButtonDisabled = async (scope: Scope, name: string) => {
    await expect(button(scope, name)).toBeDisabled()
}
