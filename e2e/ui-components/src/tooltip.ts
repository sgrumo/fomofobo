import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"

import type { Scope } from "./shared"
import { pageOf } from "./shared"

/**
 * @description Hovers the element that owns the tooltip
 * @param trigger Element that owns the tooltip
 * @remarks Climbs to the Base UI trigger wrapper, which repeats the accessible name of its child
 */
export const hoverTooltipTrigger = async (trigger: Locator) => {
    await trigger
        .locator("xpath=ancestor-or-self::*[@data-base-ui-tooltip-trigger]")
        .hover()
}

/**
 * @description Moves the pointer off the tooltip trigger
 * @param scope Search root
 */
export const unhoverTooltip = async (scope: Scope) => {
    await pageOf(scope).mouse.move(0, 0)
}

/**
 * @description Asserts the visible tooltip text
 * @param scope Search root
 * @param content Expected tooltip text
 */
export const expectTooltip = async (scope: Scope, content: string) => {
    await expect(pageOf(scope).getByText(content, { exact: true })).toBeVisible()
}

/**
 * @description Asserts the tooltip text hidden
 * @param scope Search root
 * @param content Expected tooltip text
 */
export const expectTooltipHidden = async (scope: Scope, content: string) => {
    await expect(pageOf(scope).getByText(content, { exact: true })).toBeHidden()
}
