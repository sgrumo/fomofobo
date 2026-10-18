import { expect, test } from "@playwright/test"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { gotoPage, reloadPage, t } from "../app"
import {
    blockPublicEvent,
    buildArea,
    preparePublicPage,
    seedCategory,
    seedPublicEvent,
    seedVenue,
} from "../public"

test.describe("saved events", () => {
    test.beforeEach(async ({ page }) => {
        await preparePublicPage(page)
    })

    test("lists a saved event with its status, and drops it once it is hidden", async ({
        page,
    }) => {
        const event = await seedPublicEvent(
            { venue: await seedVenue(buildArea()), category: await seedCategory() },
            {},
        )

        await gotoPage(page, "/saved/")
        await expect(page.getByText(t("shared", "Saved.Empty"))).toBeVisible()

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)
        const toggle = page.getByRole("button", { name: t("shared", "Saved.Toggle") })
        await toggle.click()
        await expect(toggle).toHaveAttribute("aria-pressed", "true")
        await expectToast(page, { type: "success" }, t("shared", "Saved.Added"))
        await dismissToast(page, { type: "success" }, t("shared", "Saved.Added"))

        await gotoPage(page, "/saved/")
        const item = page.getByRole("listitem").filter({ hasText: event.title })
        await expect(item).toBeVisible()
        await expect(item).toContainText(t("shared", "Status.upcoming"), {
            ignoreCase: true,
        })

        await blockPublicEvent(event.id)
        await reloadPage(page)

        await expect(page.getByText(t("shared", "Saved.NoneVisible"))).toBeVisible()
    })
})
