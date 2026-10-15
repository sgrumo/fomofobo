import { expect } from "@playwright/test"

import type { Scope } from "./shared"

const tab = (scope: Scope, name: string) => scope.getByRole("tab", { name, exact: true })

/**
 * @description Selects the tab and asserts the selected state
 * @param scope Search root
 * @param name Accessible name
 */
export const selectTab = async (scope: Scope, name: string) => {
    const target = tab(scope, name)
    if ((await target.getAttribute("aria-selected")) !== "true") {
        await target.click()
    }
    await expect(target).toHaveAttribute("aria-selected", "true")
}

/**
 * @description Asserts the tab is selected
 * @param scope Search root
 * @param name Accessible name
 */
export const expectSelectedTab = async (scope: Scope, name: string) => {
    await expect(tab(scope, name)).toHaveAttribute("aria-selected", "true")
}

/**
 * @description Asserts the active tab panel content
 * @param scope Search root
 * @param text Expected text
 * @remarks Inactive panels carry the hidden attribute, so only the active text is visible
 */
export const expectTabPanelContent = async (scope: Scope, text: string) => {
    await expect(scope.getByText(text, { exact: true })).toBeVisible()
}
