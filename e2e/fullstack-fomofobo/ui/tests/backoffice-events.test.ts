import { expect, test } from "@playwright/test"
import { confirmAlertDialog, getAlertDialog } from "e2e-ui-components/alert-dialog"
import { clickButton } from "e2e-ui-components/button"
import { getDialog } from "e2e-ui-components/dialog"
import { fillInput } from "e2e-ui-components/input"
import {
    clickTableRowAction,
    expectNoTableRow,
    expectTableRow,
    getTableRow,
} from "e2e-ui-components/table"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { signInAs } from "../../api/auth/utils"
import { seedEvent, seedEventReferences } from "../../api/backoffice-events/utils"
import { gotoBackofficePage, t } from "../app"
import { signInBrowser } from "../backoffice"

test.describe("backoffice events", () => {
    test("lists the own events of an Organizer, and every event with its organizer for an Admin", async ({
        page,
    }) => {
        const refs = await seedEventReferences()
        const ownTitle = `Own ${crypto.randomUUID()}`
        const otherTitle = `Other ${crypto.randomUUID()}`
        const organizer = await signInBrowser(page, "organizer")
        await seedEvent(organizer.headers, refs, { title: ownTitle })
        const other = await signInAs("organizer")
        await seedEvent(other.headers, refs, { title: otherTitle })

        await gotoBackofficePage(page, "/backoffice/events")
        await expectTableRow(page, ["exact", ownTitle])
        await expectNoTableRow(page, ["exact", otherTitle])

        await page.context().clearCookies()
        await signInBrowser(page, "admin")
        await gotoBackofficePage(page, "/backoffice/events")
        for (const { title, organizerName } of [
            { title: ownTitle, organizerName: organizer.account.name },
            { title: otherTitle, organizerName: other.account.name },
        ]) {
            await fillInput(page, t("shared", "Backoffice.Events.Search"), title)
            await expectTableRow(page, [
                ["exact", title],
                ["exact", organizerName],
            ])
        }
    })

    test("blocks an event with a reason, then unblocks it", async ({ page }) => {
        const refs = await seedEventReferences()
        const title = `Blocked ${crypto.randomUUID()}`
        const reason = `Reason ${crypto.randomUUID()}`
        const { headers } = await signInAs("organizer")
        await seedEvent(headers, refs, { title })
        await signInBrowser(page, "admin")

        await gotoBackofficePage(page, "/backoffice/events")
        await fillInput(page, t("shared", "Backoffice.Events.Search"), title)
        await clickTableRowAction(
            page,
            ["exact", title],
            t("shared", "Backoffice.Actions.Block"),
        )
        const dialog = getDialog(page, t("shared", "Backoffice.Events.Block.Title"))
        await fillInput(dialog, t("shared", "Backoffice.Events.Block.Reason"), reason)
        await clickButton(dialog, t("shared", "Backoffice.Events.Block.Submit"))

        const blockedMessage = t("shared", "Backoffice.Events.Toast.Blocked", {
            title,
        })
        await expectToast(page, { type: "success" }, blockedMessage)
        await dismissToast(page, { type: "success" }, blockedMessage)
        await expect(dialog).toBeHidden()
        await expectTableRow(page, [
            ["exact", title],
            ["exact", t("shared", "Backoffice.Filters.blocked")],
            ["exact", reason],
        ])

        await clickTableRowAction(
            page,
            ["exact", title],
            t("shared", "Backoffice.Actions.Unblock"),
        )
        await confirmAlertDialog(page, {
            confirmLabel: t("shared", "Backoffice.Actions.Unblock"),
        })

        const unblockedMessage = t("shared", "Backoffice.Events.Toast.Unblocked", {
            title,
        })
        await expectToast(page, { type: "success" }, unblockedMessage)
        await dismissToast(page, { type: "success" }, unblockedMessage)
        await expectTableRow(page, [
            ["exact", title],
            ["exact", t("shared", "Backoffice.Filters.active")],
        ])
    })

    test("deletes an event after the confirmation", async ({ page }) => {
        const refs = await seedEventReferences()
        const title = `Deleted ${crypto.randomUUID()}`
        const { headers } = await signInBrowser(page, "organizer")
        await seedEvent(headers, refs, { title })

        await gotoBackofficePage(page, "/backoffice/events")
        await clickTableRowAction(
            page,
            ["exact", title],
            t("shared", "Backoffice.Actions.Delete"),
        )
        await confirmAlertDialog(page, {
            confirmLabel: t("shared", "Backoffice.Actions.Delete"),
        })

        const message = t("shared", "Backoffice.Events.Toast.Deleted", {
            title,
        })
        await expectToast(page, { type: "success" }, message)
        await dismissToast(page, { type: "success" }, message)
        await expect(getAlertDialog(page)).toBeHidden()
        await expect(getTableRow(page, ["exact", title])).toHaveCount(0)
    })
})
