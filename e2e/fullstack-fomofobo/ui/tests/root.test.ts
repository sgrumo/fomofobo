import { expect, test } from "@playwright/test"

import { VERSION_GATE_ENV } from "../../server"
import { gotoPage, t } from "../app"
import { preparePublicPage } from "../public"

test.describe("landing", () => {
    test.beforeEach(async ({ page }) => {
        await preparePublicPage(page)
    })

    test("turns the card into the browser and the store links, and opens the map in the browser", async ({
        page,
    }) => {
        await gotoPage(page, "/")

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: t("shared", "Landing.Wordmark"),
            }),
        ).toBeVisible()

        await page.getByRole("button", { name: t("shared", "Landing.Explore") }).click()

        await expect(
            page.getByRole("link", { name: t("shared", "Landing.DownloadIos") }),
        ).toHaveAttribute("href", VERSION_GATE_ENV.IOS_STORE_URL)
        await expect(
            page.getByRole("link", { name: t("shared", "Landing.DownloadAndroid") }),
        ).toHaveAttribute("href", VERSION_GATE_ENV.ANDROID_STORE_URL)

        await page.getByRole("link", { name: t("shared", "Landing.OpenBrowser") }).click()

        await expect(page).toHaveURL(/\/it\/map\/?$/u)
        await expect(page.getByLabel(t("shared", "Search.Label"))).toBeVisible()
    })

    test("turns the card back with its bar and with Escape", async ({ page }) => {
        const explore = page.getByRole("button", { name: t("shared", "Landing.Explore") })
        const back = page.getByRole("button", { name: t("shared", "Landing.Back") })
        const openBrowser = page.getByRole("link", {
            name: t("shared", "Landing.OpenBrowser"),
        })

        await gotoPage(page, "/")

        await explore.click()
        await back.click()

        await expect(openBrowser).toBeHidden()
        await expect(explore).toBeFocused()

        await explore.click()
        await expect(back).toBeFocused()
        await page.keyboard.press("Escape")

        await expect(openBrowser).toBeHidden()
        await expect(explore).toBeVisible()
    })
})
