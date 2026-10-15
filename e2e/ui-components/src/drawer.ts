import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"

import { clickButton } from "./button"
import { t } from "./i18n"
import type { Scope } from "./shared"
import { pageOf } from "./shared"

/**
 * @description Returns the drawer locator
 * @param scope Search root
 * @param title Accessible title
 */
export const getDrawer = (scope: Scope, title?: string): Locator =>
    pageOf(scope).getByRole("dialog", title === undefined ? {} : { name: title })

/**
 * @description Clicks the trigger button and returns the open drawer for scoping
 * @param scope Search root
 * @param triggerName Accessible name of the trigger button
 * @param title Accessible title
 */
export const openDrawer = async (
    scope: Scope,
    triggerName: string,
    title?: string,
): Promise<Locator> => {
    await clickButton(scope, triggerName)
    const drawer = getDrawer(scope, title)
    await expect(drawer).toBeVisible()
    return drawer
}

/**
 * @description Closes the drawer with the localized close button
 * @param scope Search root
 * @param title Accessible title
 */
export const closeDrawer = async (scope: Scope, title?: string) => {
    const drawer = getDrawer(scope, title)
    await drawer
        .getByRole("button", { name: t("ui", "Shared.Close"), exact: true })
        .click()
    await expect(drawer).toBeHidden()
}

/**
 * @description Asserts the drawer is visible
 * @param scope Search root
 * @param title Accessible title
 */
export const expectDrawerOpen = async (scope: Scope, title: string) => {
    await expect(getDrawer(scope, title)).toBeVisible()
}

/**
 * @description Asserts the drawer is hidden
 * @param scope Search root
 * @param title Accessible title
 */
export const expectDrawerClosed = async (scope: Scope, title?: string) => {
    await expect(getDrawer(scope, title)).toBeHidden()
}
