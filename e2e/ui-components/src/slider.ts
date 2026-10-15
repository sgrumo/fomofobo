import { expect } from "@playwright/test"

import type { Scope } from "./shared"

const slider = (scope: Scope, label: string) =>
    scope.getByRole("slider", { name: label, exact: true })

/**
 * @description Fills the slider input with the value
 * @param scope Search root
 * @param label Accessible label
 * @param value Value to fill
 */
export const setSliderValue = async (scope: Scope, label: string, value: number) => {
    await slider(scope, label).fill(String(value))
}

/**
 * @description Asserts the slider value
 * @param scope Search root
 * @param label Accessible label
 * @param value Expected value
 */
export const expectSliderValue = async (scope: Scope, label: string, value: number) => {
    await expect(slider(scope, label)).toHaveValue(String(value))
}
