import { expect } from "@playwright/test"

import type { Scope } from "./shared"

/**
 * @description Asserts the value of the stat grid cell with the label
 * @param scope Search root
 * @param label Label of the cell
 * @param value Expected value text
 */
export const expectStatGridValue = async (scope: Scope, label: string, value: string) => {
    await expect(
        scope.getByRole("group", { name: label, exact: true }).getByRole("definition"),
    ).toHaveText(value)
}
