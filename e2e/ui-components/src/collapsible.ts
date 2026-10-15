import { expect } from "@playwright/test"

import type { Scope } from "./shared"

const collapsibleTrigger = (scope: Scope, triggerText: string) =>
    scope.getByRole("button", { name: triggerText, exact: true })

/**
 * @description Opens the collapsible and asserts the expanded state
 * @param scope Search root
 * @param triggerText Accessible name of the trigger button
 */
export const openCollapsible = async (scope: Scope, triggerText: string) => {
    const trigger = collapsibleTrigger(scope, triggerText)
    if ((await trigger.getAttribute("aria-expanded")) !== "true") {
        await trigger.click()
    }
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
}

/**
 * @description Closes the collapsible and asserts the collapsed state
 * @param scope Search root
 * @param triggerText Accessible name of the trigger button
 */
export const closeCollapsible = async (scope: Scope, triggerText: string) => {
    const trigger = collapsibleTrigger(scope, triggerText)
    if ((await trigger.getAttribute("aria-expanded")) === "true") {
        await trigger.click()
    }
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
}

/**
 * @description Asserts the collapsible is open
 * @param scope Search root
 * @param triggerText Accessible name of the trigger button
 */
export const expectCollapsibleOpen = async (scope: Scope, triggerText: string) => {
    await expect(collapsibleTrigger(scope, triggerText)).toHaveAttribute(
        "aria-expanded",
        "true",
    )
}

/**
 * @description Asserts the collapsible is closed
 * @param scope Search root
 * @param triggerText Accessible name of the trigger button
 */
export const expectCollapsibleClosed = async (scope: Scope, triggerText: string) => {
    await expect(collapsibleTrigger(scope, triggerText)).toHaveAttribute(
        "aria-expanded",
        "false",
    )
}

/**
 * @description Asserts the collapsible content text
 * @param scope Search root
 * @param text Expected text
 */
export const expectCollapsibleContent = async (scope: Scope, text: string) => {
    await expect(scope.getByText(text, { exact: true })).toBeVisible()
}
