import { expect } from "@playwright/test"

import { t } from "./i18n"
import type { Scope } from "./shared"
import { monthKeyOf, pageOf } from "./shared"

const dateInputTrigger = (scope: Scope, label: string) =>
    scope.getByRole("combobox", { name: label, exact: true })

export interface PickDateValue {
    year: number
    month: number
    day: number
}

/**
 * @description Picks a date with the custom-mode DateInput
 * @param scope Search root
 * @param label Accessible label
 * @param date Target year, month (1-12), and day
 * @throws When the year view label of the day picker does not parse
 */
export const pickDate = async (scope: Scope, label: string, date: PickDateValue) => {
    const page = pageOf(scope)
    const trigger = dateInputTrigger(scope, label)
    await trigger.click()

    // Filtered on the day grid: the input can live inside a dialog of its own
    const popup = page.getByRole("dialog").filter({ has: page.getByRole("grid") })
    await expect(popup).toBeVisible()

    // The header view button cycles day view -> month view -> year view
    const viewButton = popup.locator('button[aria-live="polite"]')
    await viewButton.click()
    await viewButton.click()

    // Year view: navigate the year windows until the target year is in range.
    // The grid's accessible name is "startYear - endYear".
    const grid = popup.getByRole("grid")
    for (let step = 0; step < 50; step += 1) {
        const gridLabel = (await grid.getAttribute("aria-label")) ?? ""
        const bounds = gridLabel.split("-").map(part => Math.trunc(Number(part.trim())))
        const [start, end] = bounds
        if (
            start === undefined ||
            end === undefined ||
            Number.isNaN(start) ||
            Number.isNaN(end)
        ) {
            throw new Error(`unexpected day-picker year view label: "${gridLabel}"`)
        }
        if (date.year >= start && date.year <= end) {
            break
        }

        const directionKey =
            date.year < start ? "DayPicker.PreviousYears" : "DayPicker.NextYears"
        await popup
            .getByRole("button", { name: t("ui", directionKey), exact: true })
            .click()
    }

    await popup
        .locator('button[role="gridcell"]')
        .filter({ hasText: new RegExp(`^${String(date.year)}$`, "u") })
        .click()

    const monthShort = t("ui", `Months.Short.${monthKeyOf(date.month - 1)}`)
    await popup
        .locator('button[role="gridcell"]')
        .filter({ hasText: new RegExp(`^${monthShort}$`, "u") })
        .click()

    // In-month day cells never carry aria-disabled="true"
    await popup
        .locator('button[role="gridcell"]:not([aria-disabled="true"])')
        .filter({ hasText: new RegExp(`^${String(date.day)}$`, "u") })
        .click()

    await expect(popup).toBeHidden()
    await expect(trigger).toContainText(String(date.year))
}

/**
 * @description Fills a native date input with an ISO date
 * @param scope Search root
 * @param label Accessible label
 * @param isoDate ISO date, `YYYY-MM-DD`
 */
export const fillNativeDateInput = async (
    scope: Scope,
    label: string,
    isoDate: string,
) => {
    await scope.getByLabel(label, { exact: true }).fill(isoDate)
}

/**
 * @description Clicks the reset button of the date input
 * @param scope Search root
 * @param label Accessible label
 */
export const resetDateInput = async (scope: Scope, label: string) => {
    await dateInputTrigger(scope, label)
        .getByRole("button", { name: t("ui", "DateInput.Reset"), exact: true })
        .click()
}

/**
 * @description Asserts the formatted trigger text of the date input
 * @param scope Search root
 * @param label Accessible label
 * @param formattedText Expected formatted text
 */
export const expectDateInputValue = async (
    scope: Scope,
    label: string,
    formattedText: string,
) => {
    await expect(dateInputTrigger(scope, label)).toContainText(formattedText)
}

/**
 * @description Asserts the date input shows the placeholder
 * @param scope Search root
 * @param label Accessible label
 */
export const expectDateInputEmpty = async (scope: Scope, label: string) => {
    await expect(dateInputTrigger(scope, label)).toContainText(
        t("ui", "DateInput.Placeholder"),
    )
}
