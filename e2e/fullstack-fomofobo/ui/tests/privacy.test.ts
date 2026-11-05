import { expect, test } from "@playwright/test"

import { gotoPage, t } from "../app"

const CONTACT_EMAIL = "info@quinck.io"

test.describe("privacy policy", () => {
    test("names the controller and the contact address, and links back to the map", async ({
        page,
    }) => {
        await gotoPage(page, "/privacy/")

        await expect(
            page.getByRole("heading", { level: 1, name: t("shared", "Privacy.Title") }),
        ).toBeVisible()
        await expect(
            page.getByRole("heading", {
                level: 2,
                name: t("shared", "Privacy.Sections.Controller.Title"),
            }),
        ).toBeVisible()
        await expect(
            page.getByText(
                t("shared", "Privacy.Sections.Controller.Body", { email: CONTACT_EMAIL }),
            ),
        ).toBeVisible()
        await expect(
            page.getByRole("link", {
                name: t("shared", "Legal.WriteTo", { email: CONTACT_EMAIL }),
            }),
        ).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`)
        await expect(
            page.getByRole("link", { name: t("shared", "Legal.BackHome") }),
        ).toHaveAttribute("href", "/it")
    })
})
