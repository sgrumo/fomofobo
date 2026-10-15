import { expect } from "@playwright/test"

import { t } from "./i18n"
import type { Scope } from "./shared"

/**
 * @description Returns the in-month day cell locator
 * @param scope Search root
 * @param day Day of month
 * @remarks Excludes adjacent-month cells, which repeat the same day numbers
 */
const dayCell = (scope: Scope, day: number) =>
    scope
        .locator('button[role="gridcell"]:not([aria-disabled="true"])')
        .filter({ hasText: new RegExp(`^${String(day)}$`, "u") })

/**
 * @description Clicks the in-month day cell and asserts the selection
 * @param scope Search root
 * @param day Day of month
 */
export const pickDayPickerDay = async (scope: Scope, day: number) => {
    await dayCell(scope, day).click()
    await expect(dayCell(scope, day)).toHaveAttribute("aria-selected", "true")
}

/**
 * @description Clicks the next-month button
 * @param scope Search root
 */
export const goToDayPickerNextMonth = async (scope: Scope) => {
    await scope
        .getByRole("button", { name: t("ui", "DayPicker.NextMonth"), exact: true })
        .click()
}

/**
 * @description Clicks the previous-month button
 * @param scope Search root
 */
export const goToDayPickerPreviousMonth = async (scope: Scope) => {
    await scope
        .getByRole("button", { name: t("ui", "DayPicker.PreviousMonth"), exact: true })
        .click()
}

/**
 * @description Asserts the day cell is selected
 * @param scope Search root
 * @param day Day of month
 */
export const expectDayPickerSelectedDay = async (scope: Scope, day: number) => {
    await expect(dayCell(scope, day)).toHaveAttribute("aria-selected", "true")
}

/**
 * @description Asserts the day-picker view text
 * @param scope Search root
 * @param viewText Expected view text, for example "Gennaio 2026"
 */
export const expectDayPickerView = async (scope: Scope, viewText: string) => {
    await expect(scope.getByRole("grid", { name: viewText, exact: true })).toBeVisible()
}
