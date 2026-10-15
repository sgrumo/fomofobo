import { expect } from "@playwright/test"

import type { Scope } from "./shared"
import { pageOf } from "./shared"

/**
 * @description Opens the menu and asserts it visible
 * @param scope Search root
 * @param triggerName Accessible name of the trigger button
 */
export const openMenu = async (scope: Scope, triggerName: string) => {
    const trigger = scope.getByRole("button", { name: triggerName, exact: true })
    if ((await trigger.getAttribute("aria-expanded")) !== "true") {
        await trigger.click()
    }
    await expect(pageOf(scope).getByRole("menu")).toBeVisible()
}

/**
 * @description Opens the menu and clicks the item
 * @param scope Search root
 * @param triggerName Accessible name of the trigger button
 * @param itemName Menu item name
 */
export const clickMenuItem = async (
    scope: Scope,
    triggerName: string,
    itemName: string,
) => {
    const page = pageOf(scope)
    await openMenu(scope, triggerName)
    await page.getByRole("menuitem", { name: itemName, exact: true }).click()
    await expect(page.getByRole("menu")).toBeHidden()
}

/**
 * @description Asserts a visible menu item for every name
 * @param scope Search root
 * @param names Menu item names
 * @remarks Assumes an open menu
 */
export const expectMenuItems = async (scope: Scope, names: string[]) => {
    for (const name of names) {
        await expect(
            pageOf(scope).getByRole("menuitem", { name, exact: true }),
        ).toBeVisible()
    }
}

/**
 * @description Asserts the menu is hidden
 * @param scope Search root
 */
export const expectMenuClosed = async (scope: Scope) => {
    await expect(pageOf(scope).getByRole("menu")).toBeHidden()
}
