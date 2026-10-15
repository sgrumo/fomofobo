import { expect } from "@playwright/test"

import type { Scope } from "./shared"

/**
 * @description Asserts the meter value
 * @param scope Search root
 * @param value Expected `aria-valuenow` value
 */
export const expectMeterValue = async (scope: Scope, value: number) => {
    await expect(
        scope.getByRole("meter").and(scope.locator(`[aria-valuenow="${String(value)}"]`)),
    ).toBeVisible()
}
