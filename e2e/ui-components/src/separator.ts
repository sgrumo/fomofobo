import { expect } from "@playwright/test"

import type { Scope } from "./shared"

/**
 * @description Asserts a visible separator
 * @param scope Search root
 */
export const expectSeparator = async (scope: Scope) => {
    await expect(scope.getByRole("separator")).toBeVisible()
}

/**
 * @description Asserts the separator orientation
 * @param scope Search root
 * @param orientation Expected orientation
 */
export const expectSeparatorOrientation = async (
    scope: Scope,
    orientation: "horizontal" | "vertical",
) => {
    await expect(scope.getByRole("separator")).toHaveAttribute(
        "aria-orientation",
        orientation,
    )
}
