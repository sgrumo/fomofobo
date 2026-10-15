import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"

import type { Scope } from "./shared"

/**
 * @description Returns the tick progress locator
 * @param scope Search root
 * @param label Accessible label
 */
export const getTickProgress = (scope: Scope, label: string): Locator =>
    scope.getByRole("progressbar", { name: label, exact: true })

/**
 * @description Asserts the value and the value text of the tick progress
 * @param scope Search root
 * @param label Accessible label
 * @param expected Expected `aria-valuenow` and `aria-valuetext`
 */
export const expectTickProgress = async (
    scope: Scope,
    label: string,
    expected: { value: number; valueText: string },
) => {
    const bar = getTickProgress(scope, label)
    await expect(bar).toHaveAttribute("aria-valuenow", String(expected.value))
    await expect(bar).toHaveAttribute("aria-valuetext", expected.valueText)
}
