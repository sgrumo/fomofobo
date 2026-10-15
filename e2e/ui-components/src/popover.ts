import { expect } from "@playwright/test"

import { clickButton } from "./button"
import { t } from "./i18n"
import type { Scope } from "./shared"
import { pageOf } from "./shared"

/**
 * @description Returns the popover popup locator
 * @param scope Search root
 */
const popoverPopup = (scope: Scope) => pageOf(scope).getByRole("dialog")

/**
 * @description Clicks the trigger button and asserts the popover visible
 * @param scope Search root
 * @param triggerName Accessible name of the trigger button
 */
export const openPopover = async (scope: Scope, triggerName: string) => {
    await clickButton(scope, triggerName)
    await expect(popoverPopup(scope)).toBeVisible()
}

/**
 * @description Closes the popover with the localized close button
 * @param scope Search root
 */
export const closePopover = async (scope: Scope) => {
    const popup = popoverPopup(scope)
    await popup
        .getByRole("button", { name: t("ui", "Shared.Close"), exact: true })
        .click()
    await expect(popup).toBeHidden()
}

/**
 * @description Asserts the popover content text
 * @param scope Search root
 * @param text Expected text
 */
export const expectPopoverContent = async (scope: Scope, text: string) => {
    await expect(popoverPopup(scope).getByText(text, { exact: true })).toBeVisible()
}

/**
 * @description Asserts the popover is hidden
 * @param scope Search root
 */
export const expectPopoverClosed = async (scope: Scope) => {
    await expect(popoverPopup(scope)).toBeHidden()
}
