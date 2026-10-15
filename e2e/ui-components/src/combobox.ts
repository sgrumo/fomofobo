import { expect } from "@playwright/test"

import { t } from "./i18n"
import type { Scope, TextMatch } from "./shared"
import { pageOf, textMatchTest, textMatchToRegex } from "./shared"

const comboboxTrigger = (scope: Scope, label: string) =>
    scope.getByRole("combobox", { name: label, exact: true })

/**
 * @description Opens the combobox popup
 * @param scope Search root
 * @param label Accessible label
 */
export const openCombobox = async (scope: Scope, label: string) => {
    const trigger = comboboxTrigger(scope, label)
    if ((await trigger.getAttribute("aria-expanded")) !== "true") {
        await trigger.click()
    }
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
}

/**
 * @description Closes the combobox popup with Escape
 * @param scope Search root
 * @param label Accessible label
 */
export const closeCombobox = async (scope: Scope, label: string) => {
    const trigger = comboboxTrigger(scope, label)
    if ((await trigger.getAttribute("aria-expanded")) === "true") {
        await pageOf(scope).keyboard.press("Escape")
    }
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
}

/**
 * @description Selects the matching option in a single combobox
 * @param scope Search root
 * @param label Accessible label
 * @param item Item text matcher
 * @remarks No-op when the item is already selected
 */
export const selectComboboxItem = async (
    scope: Scope,
    label: string,
    item: TextMatch,
) => {
    const trigger = comboboxTrigger(scope, label)
    const current = (await trigger.textContent()) ?? ""
    if (textMatchTest(item, current)) {
        return
    }

    await openCombobox(scope, label)
    await pageOf(scope)
        .getByRole("option", { name: textMatchToRegex(item) })
        .click()
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
}

/**
 * @description Selects the matching options in a multiple combobox
 * @param scope Search root
 * @param label Accessible label
 * @param items Item text matchers
 */
export const selectComboboxItems = async (
    scope: Scope,
    label: string,
    items: TextMatch[],
) => {
    await openCombobox(scope, label)
    for (const item of items) {
        const option = pageOf(scope).getByRole("option", {
            name: textMatchToRegex(item),
        })
        await option.click()
        await expect(option).toHaveAttribute("aria-selected", "true")
    }
    await closeCombobox(scope, label)
}

/**
 * @description Searches inside an open popup, then takes the outcome of that search
 * @param scope Search root
 * @param query Search text
 * @param outcome What to do with what the search brings up
 * @remarks Retried as one attempt: an async popup drops the text that lands before it is ready, then builds its options again on every answer
 */
const searchComboboxPopup = async (
    scope: Scope,
    query: string,
    outcome: () => Promise<void>,
) => {
    const searchInput = pageOf(scope).getByPlaceholder(
        t("ui", "Combobox.Search.Placeholder"),
        { exact: true },
    )
    await expect(async () => {
        await searchInput.fill(query)
        await outcome()
    }).toPass({ timeout: 15_000 })
}

/**
 * @description Fills the search input and selects the matching option
 * @param scope Search root
 * @param label Accessible label
 * @param query Search text
 * @param item Item text matcher
 */
export const searchComboboxItem = async (
    scope: Scope,
    label: string,
    query: string,
    item: TextMatch,
) => {
    const page = pageOf(scope)
    await openCombobox(scope, label)

    const option = page.getByRole("option", { name: textMatchToRegex(item) })
    await searchComboboxPopup(scope, query, async () => {
        await expect(option).toBeVisible({ timeout: 2000 })
        await option.click({ timeout: 2000 })
    })
    await closeCombobox(scope, label)
}

/**
 * @description Removes a chip from a multiple combobox and asserts it gone
 * @param scope Search root
 * @param label Accessible label
 * @param item Item text
 */
export const removeComboboxChip = async (scope: Scope, label: string, item: string) => {
    const chip = comboboxTrigger(scope, label)
        .locator("[data-combobox-chip]")
        .filter({ hasText: item })
    await chip
        .getByRole("button", { name: t("ui", "Combobox.Chips.Remove"), exact: true })
        .click()
    await expect(chip).toBeHidden()
}

/**
 * @description Empties the combobox with its reset button
 * @param scope Search root
 * @param label Accessible label
 */
export const resetCombobox = async (scope: Scope, label: string) => {
    const trigger = comboboxTrigger(scope, label)
    const reset = trigger.getByRole("button", {
        name: t("ui", "Combobox.Reset"),
        exact: true,
    })
    await reset.click()
    await expect(reset).toHaveCount(0)
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
}

/**
 * @description Asserts the combobox trigger text
 * @param scope Search root
 * @param label Accessible label
 * @param text Expected text
 */
export const expectComboboxValue = async (scope: Scope, label: string, text: string) => {
    await expect(comboboxTrigger(scope, label)).toContainText(text)
}

/**
 * @description Asserts a visible chip for every item
 * @param scope Search root
 * @param label Accessible label
 * @param items Item texts
 */
export const expectComboboxChips = async (
    scope: Scope,
    label: string,
    items: string[],
) => {
    const chips = comboboxTrigger(scope, label).locator("[data-combobox-chip]")
    for (const item of items) {
        await expect(chips.filter({ hasText: item })).toBeVisible()
    }
}

/**
 * @description Asserts that the search of the combobox matches nothing
 * @param scope Search root
 * @param label Accessible label
 * @param query Search text
 * @remarks Opens the popup to read the status, then closes it again
 */
export const expectComboboxEmpty = async (scope: Scope, label: string, query: string) => {
    await openCombobox(scope, label)
    const empty = pageOf(scope).getByText(t("ui", "Combobox.Empty"), { exact: true })
    await searchComboboxPopup(scope, query, async () => {
        await expect(empty).toBeVisible({ timeout: 2000 })
    })
    await closeCombobox(scope, label)
}
