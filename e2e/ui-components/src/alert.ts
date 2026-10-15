import { expect } from "@playwright/test"

import type { Scope } from "./shared"

export type AlertType = "error" | "warning" | "info" | "success" | "loading"

/**
 * @description Asserts a visible alert of the given type and text
 * @param scope Search root
 * @param opts Alert type and expected text
 */
export const expectAlert = async (
    scope: Scope,
    opts: { type: AlertType; text: string },
) => {
    const alert = scope
        .locator(`[data-alert-type="${opts.type}"]`)
        .filter({ hasText: opts.text })
    await expect(alert).toBeVisible()
}
