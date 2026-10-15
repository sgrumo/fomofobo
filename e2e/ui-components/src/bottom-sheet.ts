import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"

import { clickButton } from "./button"
import type { Scope } from "./shared"
import { pageOf } from "./shared"

/**
 * @description Returns the bottom sheet locator
 * @param scope Search root
 * @param title Accessible title
 */
export const getBottomSheet = (scope: Scope, title: string): Locator =>
    pageOf(scope).getByRole("dialog", { name: title, exact: true })

/**
 * @description Clicks the trigger button and returns the open bottom sheet for scoping
 * @param scope Search root
 * @param triggerName Accessible name of the trigger button
 * @param title Accessible title
 */
export const openBottomSheet = async (
    scope: Scope,
    triggerName: string,
    title: string,
): Promise<Locator> => {
    await clickButton(scope, triggerName)
    const sheet = getBottomSheet(scope, title)
    await expect(sheet).toBeVisible()
    return sheet
}

/**
 * @description Dismisses the bottom sheet with the Escape key
 * @param scope Search root
 * @param title Accessible title
 */
export const dismissBottomSheet = async (scope: Scope, title: string) => {
    const sheet = getBottomSheet(scope, title)
    await sheet.press("Escape")
    await expect(sheet).toBeHidden()
}

/**
 * @description Asserts the bottom sheet is visible
 * @param scope Search root
 * @param title Accessible title
 */
export const expectBottomSheetOpen = async (scope: Scope, title: string) => {
    await expect(getBottomSheet(scope, title)).toBeVisible()
}

/**
 * @description Asserts the bottom sheet is hidden
 * @param scope Search root
 * @param title Accessible title
 */
export const expectBottomSheetClosed = async (scope: Scope, title: string) => {
    await expect(getBottomSheet(scope, title)).toBeHidden()
}
