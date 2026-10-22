import { expect, test } from "@playwright/test"
import { expectStatus } from "e2e-kit/assertions"
import { expectAlert } from "e2e-ui-components/alert"
import { clickButton } from "e2e-ui-components/button"
import { fillInput } from "e2e-ui-components/input"
import { expectCurrentStep } from "e2e-ui-components/stepper"
import { expectTableRow } from "e2e-ui-components/table"
import { dismissToast, expectToast } from "e2e-ui-components/toast"
import { pressToggle } from "e2e-ui-components/toggle"

import { signInAs } from "../../api/auth/utils"
import { blockEvent } from "../../api/backoffice-events/api"
import { seedEvent, seedEventReferences } from "../../api/backoffice-events/utils"
import { saveOccurrence } from "../../api/public/api"
import { SATURDAY_NOON } from "../../api/public/utils"
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
        await pressToggle(page, t("shared", "Backoffice.EventEditor.Mode.form"))
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
        await expectCurrentStep(page, t("shared", "Backoffice.EventWizard.Steps.basics"))
        await expect(
            page.getByRole("textbox", {
                name: t("shared", "Backoffice.EventForm.Title"),
            }),
        ).toHaveValue(event.title)
    })

    test("lists each upcoming date with its saves, under the threshold too", async ({
        page,
    }) => {
        const refs = await seedEventReferences()
        const { headers } = await signInBrowser(page, "organizer")
        const event = await seedEvent(headers, refs)
        const client = {
            "x-test-now": SATURDAY_NOON,
            "x-forwarded-for": crypto.randomUUID(),
        }
        for (const deviceId of [crypto.randomUUID(), crypto.randomUUID()]) {
            expectStatus(
                await saveOccurrence({
                    headers: client,
                    pathParams: { eventId: event.id, date: "2026-10-24" },
                    body: { deviceId },
                }),
                204,
            )
        }
        await page.context().setExtraHTTPHeaders({ "x-test-now": SATURDAY_NOON })

        await gotoBackofficePage(page, `/backoffice/events/${event.id}`)

        const saves = page.getByRole("region", {
            name: t("shared", "Backoffice.EventSaves.Title"),
        })
        await expectTableRow(saves, [
            ["exact", "24/10/2026 21:00"],
            ["exact", t("shared", "Detail.Interested_other", { count: 2 })],
        ])
    })
})
