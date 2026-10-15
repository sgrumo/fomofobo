import { expect } from "@playwright/test"

import type { Scope, TextMatch } from "./shared"
import { pageOf, textMatchToRegex } from "./shared"

const accordionTrigger = (scope: Scope, title: TextMatch) =>
    scope.getByRole("button", { name: textMatchToRegex(title) })

/**
 * @description Opens the accordion item and asserts the expanded state
 * @param scope Search root
 * @param title Accessible title
 */
export const openAccordionItem = async (scope: Scope, title: TextMatch) => {
    const trigger = accordionTrigger(scope, title)
    if ((await trigger.getAttribute("aria-expanded")) !== "true") {
        await trigger.click()
    }
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
}

/**
 * @description Closes the accordion item and asserts the collapsed state
 * @param scope Search root
 * @param title Accessible title
 */
export const closeAccordionItem = async (scope: Scope, title: TextMatch) => {
    const trigger = accordionTrigger(scope, title)
    if ((await trigger.getAttribute("aria-expanded")) === "true") {
        await trigger.click()
    }
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
}

/**
 * @description Asserts a visible accordion item trigger
 * @param scope Search root
 * @param title Accessible title
 */
export const expectAccordionItemTitle = async (scope: Scope, title: TextMatch) => {
    await expect(accordionTrigger(scope, title)).toBeVisible()
}

/**
 * @description Asserts the panel content of the accordion item
 * @param scope Search root
 * @param title Accessible title
 * @param text Expected text
 */
export const expectAccordionItemContent = async (
    scope: Scope,
    title: TextMatch,
    text: string,
) => {
    const trigger = accordionTrigger(scope, title)
    const panelId = (await trigger.getAttribute("aria-controls")) ?? ""
    const panel = pageOf(scope).locator(`[id="${panelId}"]`)
    await expect(panel).toContainText(text)
}

/**
 * @description Asserts the accordion item is open
 * @param scope Search root
 * @param title Accessible title
 */
export const expectAccordionItemOpen = async (scope: Scope, title: TextMatch) => {
    await expect(accordionTrigger(scope, title)).toHaveAttribute("aria-expanded", "true")
}

/**
 * @description Asserts the accordion item is closed
 * @param scope Search root
 * @param title Accessible title
 */
export const expectAccordionItemClosed = async (scope: Scope, title: TextMatch) => {
    await expect(accordionTrigger(scope, title)).toHaveAttribute("aria-expanded", "false")
}
