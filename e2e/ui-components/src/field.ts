import { expect } from "@playwright/test"
import { match } from "ts-pattern"

import { t } from "./i18n"
import type { Scope } from "./shared"
import { pageOf } from "./shared"

/**
 * @description Returns the Field root that holds the label
 * @param scope Search root
 * @param label Accessible label
 * @remarks Depends on the Field DOM depth, three ancestors above the label text node
 */
const fieldRoot = (scope: Scope, label: string) =>
    scope.getByText(label, { exact: true }).locator("xpath=../../..")

/**
 * @description Asserts the view-mode value of the field
 * @param scope Search root
 * @param label Accessible label
 * @param value Expected value
 */
export const expectFieldViewValue = async (
    scope: Scope,
    label: string,
    value: string,
) => {
    await expect(fieldRoot(scope, label).getByText(value, { exact: true })).toBeVisible()
}

export type FieldViewSelection = "selected" | "not-selected" | "indeterminate"

/**
 * @description Asserts the view-mode selection state of the field
 * @param scope Search root
 * @param label Accessible label
 * @param state Expected selection state
 * @remarks View mode renders selection controls as a SelectionIndicator, an `img` role with an accessible name
 */
export const expectFieldViewSelection = async (
    scope: Scope,
    label: string,
    state: FieldViewSelection,
) => {
    const key = match(state)
        .with("selected", () => "SelectionIndicator.Selected")
        .with("not-selected", () => "SelectionIndicator.NotSelected")
        .with("indeterminate", () => "SelectionIndicator.Indeterminate")
        .exhaustive()
    await expect(
        fieldRoot(scope, label).getByRole("img", { name: t("ui", key), exact: true }),
    ).toBeAttached()
}

/**
 * @description Hovers the info button next to the field label
 * @param scope Search root
 * @param label Accessible label
 */
export const hoverFieldInfo = async (scope: Scope, label: string) => {
    await fieldRoot(scope, label)
        .getByRole("button", { name: t("ui", "Field.MoreInfo"), exact: true })
        .hover()
}

/**
 * @description Asserts the visible description tooltip of a field
 * @param scope Search root
 * @param description Expected description
 * @remarks Reads the portal, not the field: the popup shows only while `hoverFieldInfo` holds the pointer
 */
export const expectFieldDescription = async (scope: Scope, description: string) => {
    // The Field renders the description twice: a hidden node next to the
    // label and the tooltip popup. Keep the visible popup only.
    await expect(
        pageOf(scope).getByText(description, { exact: true }).filter({ visible: true }),
    ).toBeVisible()
}
