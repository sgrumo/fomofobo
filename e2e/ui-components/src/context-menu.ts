import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"

import type { Scope } from "./shared"
import { pageOf } from "./shared"

/**
 * @description Opens the context menu with a right click on the target
 * @param target Element that owns the context menu
 */
export const openContextMenu = async (target: Locator) => {
    await target.click({ button: "right" })
    await expect(target.page().getByRole("menu")).toBeVisible()
}

/**
 * @description Opens the context menu and clicks the item
 * @param target Element that owns the context menu
 * @param itemName Menu item name
 */
export const clickContextMenuItem = async (target: Locator, itemName: string) => {
    const page = target.page()
    await openContextMenu(target)
    await page.getByRole("menuitem", { name: itemName, exact: true }).click()
    await expect(page.getByRole("menu")).toBeHidden()
}

/**
 * @description Asserts a visible context menu item
 * @param scope Search root
 * @param itemName Menu item name
 * @remarks Assumes an open context menu
 */
export const expectContextMenuItem = async (scope: Scope, itemName: string) => {
    await expect(
        pageOf(scope).getByRole("menuitem", { name: itemName, exact: true }),
    ).toBeVisible()
}
