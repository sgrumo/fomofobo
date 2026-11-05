import { expect, test } from "@playwright/test"

import { gotoPage, t } from "../app"

const CONTACT_EMAIL = "info@quinck.io"

test.describe("support", () => {
    test("offers the contact address and opens the privacy policy", async ({ page }) => {
        await gotoPage(page, "/support/")

        await expect(
            page.getByRole("heading", { level: 1, name: t("shared", "Support.Title") }),
        ).toBeVisible()
        await expect(
            page.getByRole("link", {
                name: t("shared", "Legal.WriteTo", { email: CONTACT_EMAIL }),
            }),
        ).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`)

        await page.getByRole("link", { name: t("shared", "Legal.Privacy") }).click()

        await expect(page).toHaveURL(/\/privacy\/?$/u)
        await expect(
            page.getByRole("heading", { level: 1, name: t("shared", "Privacy.Title") }),
        ).toBeVisible()
    })
})
