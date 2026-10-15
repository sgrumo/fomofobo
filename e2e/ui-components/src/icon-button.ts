import type { Scope } from "./shared"

/**
 * @description Clicks an icon button by its accessible name
 * @param scope Search root
 * @param name The `aria-label` of the button
 */
export const clickIconButton = async (scope: Scope, name: string) => {
    await scope.getByRole("button", { name, exact: true }).click()
}
