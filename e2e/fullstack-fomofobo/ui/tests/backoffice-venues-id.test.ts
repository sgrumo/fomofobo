import { expect, test } from "@playwright/test"
import { clickButton } from "e2e-ui-components/button"
import { getDialog } from "e2e-ui-components/dialog"
import { expectInputValue, fillInput } from "e2e-ui-components/input"
import { expectSelectValue, selectSelectItem } from "e2e-ui-components/select"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { signInAs } from "../../api/auth/utils"
import { gotoBackofficePage, reloadPage, t } from "../app"
import { signInBrowser } from "../backoffice"
import { buildArea, keepMapOffline, seedVenue } from "../public"

test.describe("backoffice venue", () => {
    test.beforeEach(async ({ page }) => {
        await keepMapOffline(page)
    })

    test("lets an Admin edit the profile of a venue", async ({ page }) => {
        const venue = await seedVenue(buildArea())
        const newName = `Renamed ${crypto.randomUUID()}`
        const description = "Concerts in the cloister every Friday."
        const website = "https://www.chiostro-imola.it"
        await signInBrowser(page, "admin")

        await gotoBackofficePage(page, `/backoffice/venues/${venue.id}`)
        await fillInput(page, t("shared", "Backoffice.VenueForm.Name"), newName)
        await fillInput(
            page,
            t("shared", "Backoffice.VenueForm.Description"),
            description,
        )
        await fillInput(page, t("shared", "Backoffice.VenueForm.Website"), website)
        await clickButton(page, t("shared", "Backoffice.Actions.Save"))

        const message = t("shared", "Backoffice.Venues.Toast.Updated", { name: newName })
        await expectToast(page, { type: "success" }, message)
        await dismissToast(page, { type: "success" }, message)
        await reloadPage(page)
        await expect(page.getByRole("heading", { name: newName })).toBeVisible()
        await expectInputValue(
            page,
            t("shared", "Backoffice.VenueForm.Description"),
            description,
        )
        await expectInputValue(page, t("shared", "Backoffice.VenueForm.Website"), website)
    })

    test("lets an Admin give the venue to an Organizer, then block it", async ({
        page,
    }) => {
        const venue = await seedVenue(buildArea())
        const organizer = await signInAs("organizer")
        const reason = "Closed for works"
        await signInBrowser(page, "admin")

        await gotoBackofficePage(page, `/backoffice/venues/${venue.id}`)
        await selectSelectItem(page, t("shared", "Backoffice.Venue.Owner"), [
            "exact",
            organizer.account.name,
        ])
        await clickButton(page, t("shared", "Backoffice.Venue.SaveOwner"))

        const saved = t("shared", "Backoffice.Venues.Toast.Updated", { name: venue.name })
        await expectToast(page, { type: "success" }, saved)
        await dismissToast(page, { type: "success" }, saved)
        await clickButton(page, t("shared", "Backoffice.Actions.Block"))
        const dialog = getDialog(page, t("shared", "Backoffice.Venues.Block.Title"))
        await fillInput(dialog, t("shared", "Backoffice.Events.Block.Reason"), reason)
        await clickButton(dialog, t("shared", "Backoffice.Venues.Block.Submit"))

        const blocked = t("shared", "Backoffice.Venues.Toast.Blocked", {
            name: venue.name,
        })
        await expectToast(page, { type: "success" }, blocked)
        await dismissToast(page, { type: "success" }, blocked)
        await expect(
            page.getByText(t("shared", "Backoffice.Venue.BlockedWithReason", { reason })),
        ).toBeVisible()
        await reloadPage(page)
        await expectSelectValue(
            page,
            t("shared", "Backoffice.Venue.Owner"),
            organizer.account.name,
        )
    })

    test("shows a venue it does not own to an Organizer, read-only", async ({ page }) => {
        const venue = await seedVenue(buildArea())
        await signInBrowser(page, "organizer")

        await gotoBackofficePage(page, `/backoffice/venues/${venue.id}`)

        await expect(
            page.getByText(t("shared", "Backoffice.Venue.ReadOnly")),
        ).toBeVisible()
        await expect(
            page.getByRole("button", { name: t("shared", "Backoffice.Actions.Save") }),
        ).toHaveCount(0)
    })
})
