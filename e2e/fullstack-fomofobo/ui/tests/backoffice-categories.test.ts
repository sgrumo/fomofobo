import { expect, test } from "@playwright/test"
import {
    cancelAlertDialog,
    confirmAlertDialog,
    getAlertDialog,
} from "e2e-ui-components/alert-dialog"
import { clickButton } from "e2e-ui-components/button"
import { getDialog } from "e2e-ui-components/dialog"
import { fillInput } from "e2e-ui-components/input"
import { selectSelectItem } from "e2e-ui-components/select"
import { clickTableRowAction, expectTableRow, getTableRow } from "e2e-ui-components/table"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { signInAs } from "../../api/auth/utils"
import { seedEvent } from "../../api/backoffice-events/utils"
import { gotoBackofficePage, t } from "../app"
import { buildPhotoFile, signInBrowser } from "../backoffice"
import { buildArea, seedCategory, seedVenue } from "../public"

test.describe("backoffice categories", () => {
    test("creates a category with its icon, then deletes it", async ({ page }) => {
        const name = `Category ${crypto.randomUUID().slice(0, 8)}`
        await signInBrowser(page, "admin")

        await gotoBackofficePage(page, "/backoffice/categories")
        await clickButton(page, t("shared", "Backoffice.Categories.New"))
        const dialog = getDialog(page, t("shared", "Backoffice.Categories.Create.Title"))
        await fillInput(dialog, t("shared", "Backoffice.CategoryForm.Name"), name)
        await selectSelectItem(dialog, t("shared", "Backoffice.CategoryForm.Icon"), [
            "exact",
            t("shared", "Backoffice.CategoryForm.Icons.theatre"),
        ])
        await clickButton(dialog, t("shared", "Backoffice.Categories.Create.Submit"))

        const created = t("shared", "Backoffice.Categories.Toast.Created", { name })
        await expectToast(page, { type: "success" }, created)
        await dismissToast(page, { type: "success" }, created)
        await expectTableRow(page, ["exact", name])

        await clickTableRowAction(
            page,
            ["exact", name],
            t("shared", "Backoffice.Actions.Delete"),
        )
        await confirmAlertDialog(page, {
            confirmLabel: t("shared", "Backoffice.Actions.Delete"),
        })

        const deleted = t("shared", "Backoffice.Categories.Toast.Deleted", { name })
        await expectToast(page, { type: "success" }, deleted)
        await dismissToast(page, { type: "success" }, deleted)
        await expect(getAlertDialog(page)).toBeHidden()
        await expect(getTableRow(page, ["exact", name])).toHaveCount(0)
    })

    test("uploads the image of a category from its edit dialog", async ({ page }) => {
        const category = await seedCategory()
        await signInBrowser(page, "admin")

        await gotoBackofficePage(page, "/backoffice/categories")
        await clickTableRowAction(
            page,
            ["exact", category.name],
            t("shared", "Backoffice.Actions.Edit"),
        )
        const dialog = getDialog(page, t("shared", "Backoffice.Categories.Update.Title"))
        await dialog
            .getByLabel(t("shared", "Backoffice.CategoryImage.Upload"), { exact: true })
            .setInputFiles(await buildPhotoFile())

        const updated = t("shared", "Backoffice.Categories.Toast.Updated", {
            name: category.name,
        })
        await expectToast(page, { type: "success" }, updated)
        await dismissToast(page, { type: "success" }, updated)
        await expect(
            dialog.getByRole("img", {
                name: t("shared", "Backoffice.CategoryImage.Label"),
            }),
        ).toBeVisible()
    })

    test("refuses to delete a category that an event uses", async ({ page }) => {
        const category = await seedCategory()
        const venue = await seedVenue(buildArea())
        const organizer = await signInAs("organizer")
        await seedEvent(organizer.headers, { categoryId: category.id, venueId: venue.id })
        await signInBrowser(page, "admin")

        await gotoBackofficePage(page, "/backoffice/categories")
        await clickTableRowAction(
            page,
            ["exact", category.name],
            t("shared", "Backoffice.Actions.Delete"),
        )
        // The refusal keeps the confirmation open
        await clickButton(getAlertDialog(page), t("shared", "Backoffice.Actions.Delete"))

        const refusal = t("shared", "Backoffice.Errors.CategoryInUse")
        await expectToast(page, { title: t("ui", "Toast.Error.Api.Title") }, refusal)
        await dismissToast(page, { title: t("ui", "Toast.Error.Api.Title") }, refusal)
        await cancelAlertDialog(page)
        await expectTableRow(page, ["exact", category.name])
    })
})
