import { expect, test } from "@playwright/test"
import { clickIconButton } from "e2e-ui-components/icon-button"
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

test.describe("event detail", () => {
    test.beforeEach(async ({ page }) => {
        await preparePublicPage(page)
    })

    test("renders the occurrence on a direct load, and answers not found once it is hidden", async ({
        page,
    }) => {
        const venue = await seedVenue(buildArea())
        const event = await seedPublicEvent({ venue, category: await seedCategory() }, {})

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)

        await expect(
            page.getByRole("heading", { level: 1, name: event.title }),
        ).toBeVisible()
        await expect(page.getByText(venue.address)).toBeVisible()
        await expect(page.getByText("10 €")).toBeVisible()
        await expect(
            page.getByRole("link", { name: t("shared", "Detail.Instagram") }),
        ).toHaveAttribute("href", "https://www.instagram.com/fomofobo")
        await expect(
            page.getByRole("link", { name: t("shared", "Detail.Directions") }),
        ).toHaveAttribute(
            "href",
            `https://www.google.com/maps/dir/?api=1&destination=${String(venue.coordinates.latitude)},${String(venue.coordinates.longitude)}`,
        )

        await blockPublicEvent(event.id)
        await reloadPage(page)

        await expect(page.getByText(t("shared", "NotFound.Title"))).toBeVisible()
    })

    test("copies the link where the browser has no share sheet", async ({
        page,
        context,
    }) => {
        const event = await seedPublicEvent(
            { venue: await seedVenue(buildArea()), category: await seedCategory() },
            {},
        )
        await context.grantPermissions(["clipboard-read", "clipboard-write"])
        await page.addInitScript(() => {
            Reflect.deleteProperty(Navigator.prototype, "share")
            Reflect.deleteProperty(Navigator.prototype, "canShare")
        })

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)
        await clickIconButton(page, t("shared", "Detail.Share"))

        await expectToast(page, { type: "success" }, t("shared", "Detail.LinkCopied"))
        await dismissToast(page, { type: "success" }, t("shared", "Detail.LinkCopied"))
        // A string expression: the suite compiles without the DOM types of the browser.
        expect(await page.evaluate("navigator.clipboard.readText()")).toBe(page.url())
    })
})
