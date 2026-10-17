import { expect, test } from "@playwright/test"
import { expectStatus } from "e2e-kit/assertions"
import { expectAlert } from "e2e-ui-components/alert"
import { clickButton } from "e2e-ui-components/button"
import { fillInput } from "e2e-ui-components/input"
import { expectTableRow } from "e2e-ui-components/table"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { signInAs } from "../../api/auth/utils"
import { blockEvent } from "../../api/backoffice-events/api"
import { seedEvent, seedEventReferences } from "../../api/backoffice-events/utils"
import { gotoBackofficePage, t } from "../app"
import { signInBrowser } from "../backoffice"

test.describe("backoffice event", () => {
    test("saves a new title", async ({ page }) => {
        const refs = await seedEventReferences()
        const title = `Before ${crypto.randomUUID()}`
        const newTitle = `After ${crypto.randomUUID()}`
        const { headers } = await signInBrowser(page, "organizer")
        const event = await seedEvent(headers, refs, { title })

        await gotoBackofficePage(page, `/backoffice/events/${event.id}`)
        await fillInput(page, t("shared", "Backoffice.EventForm.Title"), newTitle)
        await clickButton(page, t("shared", "Backoffice.Actions.Save"))

        const message = t("shared", "Backoffice.EventEditor.Saved", { title: newTitle })
        await expectToast(page, { type: "success" }, message)
        await dismissToast(page, { type: "success" }, message)
        await expectTableRow(page, ["exact", newTitle])
    })

    test("shows the Organizer the block of an Admin and its reason", async ({ page }) => {
        const refs = await seedEventReferences()
        const reason = `Reason ${crypto.randomUUID()}`
        const { headers } = await signInBrowser(page, "organizer")
        const event = await seedEvent(headers, refs)
        const admin = await signInAs("admin")
        expectStatus(
            await blockEvent({
                headers: admin.headers,
                pathParams: { id: event.id },
                body: { reason },
            }),
            200,
        )

        await gotoBackofficePage(page, `/backoffice/events/${event.id}`)

        await expectAlert(page, {
            type: "warning",
            text: t("shared", "Backoffice.EventEditor.BlockedWithReason", { reason }),
        })
        await expect(
            page.getByRole("textbox", {
                name: t("shared", "Backoffice.EventForm.Title"),
            }),
        ).toHaveValue(event.title)
    })
})
