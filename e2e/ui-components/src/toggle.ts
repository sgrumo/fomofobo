import { expect } from "@playwright/test"

import type { Scope } from "./shared"

const toggle = (scope: Scope, name: string) =>
    scope.getByRole("button", { name, exact: true })

/**
 * @description Presses the toggle and asserts the pressed state
 * @param scope Search root
 * @param name Accessible name
 */
export const pressToggle = async (scope: Scope, name: string) => {
    const target = toggle(scope, name)
    if ((await target.getAttribute("aria-pressed")) !== "true") {
        await target.click()
    }
    await expect(target).toHaveAttribute("aria-pressed", "true")
}

/**
 * @description Unpresses the toggle and asserts the unpressed state
 * @param scope Search root
 * @param name Accessible name
 */
export const unpressToggle = async (scope: Scope, name: string) => {
    const target = toggle(scope, name)
    if ((await target.getAttribute("aria-pressed")) === "true") {
        await target.click()
    }
    await expect(target).toHaveAttribute("aria-pressed", "false")
}

/**
 * @description Asserts the toggle is pressed
 * @param scope Search root
 * @param name Accessible name
 */
export const expectTogglePressed = async (scope: Scope, name: string) => {
    await expect(toggle(scope, name)).toHaveAttribute("aria-pressed", "true")
}

/**
 * @description Asserts the toggle is not pressed
 * @param scope Search root
 * @param name Accessible name
 */
export const expectToggleNotPressed = async (scope: Scope, name: string) => {
    await expect(toggle(scope, name)).toHaveAttribute("aria-pressed", "false")
}
