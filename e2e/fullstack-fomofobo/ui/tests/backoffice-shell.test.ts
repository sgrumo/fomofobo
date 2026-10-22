import { expect, test } from "@playwright/test"
import { clickMenuItem } from "e2e-ui-components/menu"

import { gotoBackofficePage, t } from "../app"
import { signInBrowser } from "../backoffice"

test.describe("backoffice shell", () => {
    test("shows each role its sections", async ({ page }) => {
        const sections = [
            { role: "organizer", names: ["Events", "Venues"] },
            {
                role: "admin",
                names: ["Events", "Venues", "Categories", "Organizers", "Settings"],
            },
        ] as const

        for (const { role, names } of sections) {
            await page.context().clearCookies()
            await signInBrowser(page, role)
            await gotoBackofficePage(page, "/backoffice/events")

            const navigation = page.getByRole("navigation", {
                name: t("shared", "Backoffice.Nav.Label"),
            })
            await expect(navigation.getByRole("link")).toHaveText(
                names.map(name => t("shared", `Backoffice.Nav.${name}`)),
            )
        }
    })

    test("answers not found to an Organizer on an Admin page", async ({ page }) => {
        await signInBrowser(page, "organizer")

        await gotoBackofficePage(page, "/backoffice/organizers")

        await expect(page.getByText(t("shared", "NotFound.Title"))).toBeVisible()
    })

    test("sends a visitor with no session to the login page, with the page to return to", async ({
        page,
    }) => {
        await gotoBackofficePage(page, "/backoffice/events/new")

        await expect(page).toHaveURL(
            /\/backoffice\/login\?return-to=%2Fbackoffice%2Fevents%2Fnew$/u,
        )
    })

    test("signs out from the account menu", async ({ page }) => {
        await signInBrowser(page, "organizer")
        await gotoBackofficePage(page, "/backoffice/events")

        await clickMenuItem(
            page,
            t("shared", "Session.Menu"),
            t("shared", "Session.SignOut"),
        )

        await expect(page).toHaveURL(/\/backoffice\/login$/u)
        await gotoBackofficePage(page, "/backoffice/events")
        await expect(page).toHaveURL(/\/backoffice\/login\?return-to=/u)
    })
})
