import { expect, test } from "@playwright/test"
import { clickButton } from "e2e-ui-components/button"
import { searchComboboxItem } from "e2e-ui-components/combobox"
import { getDialog } from "e2e-ui-components/dialog"
import { expectInputValue, fillInput } from "e2e-ui-components/input"
import { clickTableRowAction, expectTableRow, getTableRow } from "e2e-ui-components/table"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { gotoBackofficePage, t } from "../app"
import { signInBrowser } from "../backoffice"
import { buildArea, keepMapOffline, seedVenue } from "../public"

test.describe("backoffice venues", () => {
    test.beforeEach(async ({ page }) => {
        await keepMapOffline(page)
    })

    test("creates a venue from an address search", async ({ page }) => {
        const name = `Venue ${crypto.randomUUID()}`
        // The place search answers the text it received in lower case
        const street = `via ${crypto.randomUUID().slice(0, 8)}`
        const address = `${street}, Imola, Italy`
        await signInBrowser(page, "organizer")

        await gotoBackofficePage(page, "/backoffice/venues")
        await clickButton(page, t("shared", "Backoffice.Venues.New"))
        const dialog = getDialog(page, t("shared", "Backoffice.Venues.Create.Title"))
        await fillInput(dialog, t("shared", "Backoffice.VenueForm.Name"), name)
        await searchComboboxItem(
            dialog,
            t("shared", "Backoffice.VenueForm.Search"),
            street,
            ["exact", address],
        )
        await expectInputValue(
            dialog,
            t("shared", "Backoffice.VenueForm.Address"),
            address,
        )
        await clickButton(dialog, t("shared", "Backoffice.Venues.Create.Submit"))

        const message = t("shared", "Backoffice.Venues.Toast.Created", { name })
        await expectToast(page, { type: "success" }, message)
        await dismissToast(page, { type: "success" }, message)
        await expect(dialog).toBeHidden()
        await fillInput(page, t("shared", "Backoffice.Venues.Search"), name)
        await expectTableRow(page, [
            ["exact", name],
            ["exact", address],
        ])
        // PLACEHOLDER(OP-20): an Organizer edits no venue
        await expect(
            getTableRow(page, ["exact", name]).getByRole("button", {
                name: t("shared", "Backoffice.Actions.Edit"),
            }),
        ).toHaveCount(0)
    })

    test("lets an Admin rename a venue", async ({ page }) => {
        const venue = await seedVenue(buildArea())
        const newName = `Renamed ${crypto.randomUUID()}`
        await signInBrowser(page, "admin")

        await gotoBackofficePage(page, "/backoffice/venues")
        await fillInput(page, t("shared", "Backoffice.Venues.Search"), venue.name)
        await clickTableRowAction(
            page,
            ["exact", venue.name],
            t("shared", "Backoffice.Actions.Edit"),
        )
        const dialog = getDialog(page, t("shared", "Backoffice.Venues.Update.Title"))
        await fillInput(dialog, t("shared", "Backoffice.VenueForm.Name"), newName)
        await clickButton(dialog, t("shared", "Backoffice.Actions.Save"))

        const message = t("shared", "Backoffice.Venues.Toast.Updated", { name: newName })
        await expectToast(page, { type: "success" }, message)
        await dismissToast(page, { type: "success" }, message)
        await fillInput(page, t("shared", "Backoffice.Venues.Search"), newName)
        await expectTableRow(page, [
            ["exact", newName],
            ["exact", venue.address],
        ])
    })
})
