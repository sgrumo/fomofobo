import { expect } from "@playwright/test"

import { t } from "./i18n"
import type { Scope, TextMatch } from "./shared"
import { pageOf, textMatchTest, textMatchToRegex } from "./shared"

const selectTrigger = (scope: Scope, label: string) =>
    scope.getByRole("combobox", { name: label, exact: true })

/**
 * @description Opens the select popup
 * @param scope Search root
 * @param label Accessible label
 */
const openSelect = async (scope: Scope, label: string) => {
    const trigger = selectTrigger(scope, label)
    if ((await trigger.getAttribute("aria-expanded")) !== "true") {
        await trigger.click()
    }
    await expect(pageOf(scope).getByRole("listbox")).toBeVisible()
}

/**
 * @description Closes the select popup with Escape
 * @param scope Search root
 * @param label Accessible label
 */
const closeSelect = async (scope: Scope, label: string) => {
    const trigger = selectTrigger(scope, label)
    if ((await trigger.getAttribute("aria-expanded")) === "true") {
        await pageOf(scope).keyboard.press("Escape")
    }
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
}

/**
 * @description Selects the matching option in a single select
 * @param scope Search root
 * @param label Accessible label
 * @param item Item text matcher
 * @remarks No-op when the item is already selected
 */
export const selectSelectItem = async (scope: Scope, label: string, item: TextMatch) => {
    const trigger = selectTrigger(scope, label)
    const current = (await trigger.textContent()) ?? ""
    if (textMatchTest(item, current)) {
        return
    }

    await openSelect(scope, label)
    await pageOf(scope)
        .getByRole("option", { name: textMatchToRegex(item) })
        .click()
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
}

/**
 * @description Selects the matching options in a multiple select
 * @param scope Search root
 * @param label Accessible label
 * @param items Item text matchers
 */
export const selectSelectItems = async (
    scope: Scope,
    label: string,
    items: TextMatch[],
) => {
    await openSelect(scope, label)
    for (const item of items) {
        const option = pageOf(scope).getByRole("option", {
            name: textMatchToRegex(item),
        })
        await option.click()
        await expect(option).toHaveAttribute("aria-selected", "true")
    }
    await closeSelect(scope, label)
}

/**
 * @description Empties the select with its reset button
 * @param scope Search root
 * @param label Accessible label
 */
export const resetSelect = async (scope: Scope, label: string) => {
    const trigger = selectTrigger(scope, label)
    const reset = trigger.getByRole("button", {
        name: t("ui", "Combobox.Reset"),
        exact: true,
    })
    await reset.click()
    await expect(reset).toHaveCount(0)
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
}

/**
 * @description Asserts the select trigger text
 * @param scope Search root
 * @param label Accessible label
 * @param text Expected text
 */
export const expectSelectValue = async (scope: Scope, label: string, text: string) => {
    await expect(selectTrigger(scope, label)).toContainText(text)
}

/**
 * @description Asserts the select shows the placeholder
 * @param scope Search root
 * @param label Accessible label
 * @param placeholder Expected placeholder, localized default
 */
export const expectSelectPlaceholder = async (
    scope: Scope,
    label: string,
    placeholder?: string,
) => {
    await expect(selectTrigger(scope, label).locator("[data-placeholder]")).toContainText(
        placeholder ?? t("ui", "Combobox.Placeholder"),
    )
}

/**
 * @description Opens the select and asserts a visible option for every item
 * @param scope Search root
 * @param label Accessible label
 * @param items Item texts
 */
export const expectSelectOptions = async (
    scope: Scope,
    label: string,
    items: string[],
) => {
    await openSelect(scope, label)
    for (const item of items) {
        await expect(
            pageOf(scope).getByRole("option", { name: item, exact: true }),
        ).toBeVisible()
    }
    await closeSelect(scope, label)
}
