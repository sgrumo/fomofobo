import { expect } from "@playwright/test"

import type { Scope } from "./shared"

/**
 * @description Asserts the progressbar value
 * @param scope Search root
 * @param value Expected `aria-valuenow` value
 */
export const expectProgressValue = async (scope: Scope, value: number) => {
    await expect(
        scope
            .getByRole("progressbar")
            .and(scope.locator(`[aria-valuenow="${String(value)}"]`)),
    ).toBeVisible()
}

/**
 * @description Asserts the progressbar carries the `data-complete` attribute
 * @param scope Search root
 */
export const expectProgressComplete = async (scope: Scope) => {
    await expect(
        scope.getByRole("progressbar").and(scope.locator("[data-complete]")),
    ).toBeVisible()
}
