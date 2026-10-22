import { expect, test } from "@playwright/test"
import { expectStatus } from "e2e-kit/assertions"
import { clickButton } from "e2e-ui-components/button"
import { searchComboboxItem } from "e2e-ui-components/combobox"
import { getDialog } from "e2e-ui-components/dialog"
import { expectInputValue, fillInput } from "e2e-ui-components/input"
import { selectSelectItem } from "e2e-ui-components/select"
import { expectTableRow, getTableRow } from "e2e-ui-components/table"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { blockVenue } from "../../api/backoffice-venues/api"
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
        const { account } = await signInBrowser(page, "organizer")

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
        await expectTableRow(page, [
            ["exact", name],
            ["exact", address],
            ["exact", account.name],
        ])

        await clickButton(page, t("shared", "Backoffice.Venues.New"))
        const second = getDialog(page, t("shared", "Backoffice.Venues.Create.Title"))
        await fillInput(
            second,
            t("shared", "Backoffice.VenueForm.Name"),
            `Second ${name}`,
        )
        await fillInput(second, t("shared", "Backoffice.VenueForm.Address"), address)
        await fillInput(second, t("shared", "Backoffice.VenueForm.Latitude"), "44.35")
        await fillInput(second, t("shared", "Backoffice.VenueForm.Longitude"), "11.71")
        await clickButton(second, t("shared", "Backoffice.Venues.Create.Submit"))

        const refusal = t("shared", "Backoffice.Errors.VenueLimitReached")
        await expectToast(page, { title: t("ui", "Toast.Error.Api.Title") }, refusal)
        await dismissToast(page, { title: t("ui", "Toast.Error.Api.Title") }, refusal)
    })

    test("lets an Admin filter the blocked venues", async ({ page }) => {
        const open = await seedVenue(buildArea())
        const closed = await seedVenue(buildArea())
        const { headers } = await signInBrowser(page, "admin")
        expectStatus(
            await blockVenue({
                headers,
                pathParams: { id: closed.id },
                body: { reason: "Closed for works" },
            }),
            200,
        )

        await gotoBackofficePage(page, "/backoffice/venues")
        await selectSelectItem(page, t("shared", "Backoffice.Filters.State"), [
            "exact",
            t("shared", "Backoffice.Filters.blocked"),
        ])

        await expectTableRow(page, [
            ["exact", closed.name],
            ["exact", t("shared", "Backoffice.Filters.blocked")],
        ])
        await expect(getTableRow(page, ["exact", open.name])).toHaveCount(0)
    })
})
