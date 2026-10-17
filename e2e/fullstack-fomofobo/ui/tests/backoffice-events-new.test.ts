import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import { expectStatus } from "e2e-kit/assertions"
import { clickButton } from "e2e-ui-components/button"
import { checkCheckbox } from "e2e-ui-components/checkbox"
import { selectComboboxItem, selectComboboxItems } from "e2e-ui-components/combobox"
import { fillNativeDateInput } from "e2e-ui-components/date-input"
import { fillInput } from "e2e-ui-components/input"
import { selectSelectItem } from "e2e-ui-components/select"
import { expectTableRow } from "e2e-ui-components/table"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { getEvent, listEvents } from "../../api/backoffice-events/api"
import { gotoBackofficePage, t } from "../app"
import { signInBrowser } from "../backoffice"
import { buildArea, seedCategory, seedVenue } from "../public"

/**
 * @description Fills the fields every event needs: title, category, venue, times and one photo
 * @param page Page of the event form
 * @param event Title, category, venue and start date of the event
 */
const fillEventEssentials = async (
    page: Page,
    event: { title: string; categoryName: string; venueName: string; date: string },
) => {
    await fillInput(page, t("shared", "Backoffice.EventForm.Title"), event.title)
    await selectComboboxItems(page, t("shared", "Backoffice.EventForm.Categories"), [
        ["exact", event.categoryName],
    ])
    await selectComboboxItem(page, t("shared", "Backoffice.EventForm.Venue"), [
        "exact",
        event.venueName,
    ])
    await fillNativeDateInput(
        page,
        t("shared", "Backoffice.EventForm.StartDate"),
        event.date,
    )
    await fillInput(page, t("shared", "Backoffice.EventForm.StartTime"), "21:00")
    await fillInput(page, t("shared", "Backoffice.EventForm.EndTime"), "23:30")
    await page
        .getByLabel(t("shared", "Backoffice.Photos.Label"), { exact: true })
        .setInputFiles({
            name: "cover.png",
            mimeType: "image/png",
            buffer: Buffer.from(crypto.getRandomValues(new Uint8Array(2048))),
        })
    await expect(
        page.getByRole("img", {
            name: t("shared", "Backoffice.Photos.Photo", { index: 1 }),
        }),
    ).toBeVisible()
}

test.describe("backoffice new event", () => {
    test("creates a single event with a photo, and lists it", async ({ page }) => {
        const category = await seedCategory()
        const venue = await seedVenue(buildArea())
        const title = `Single ${crypto.randomUUID()}`
        await signInBrowser(page, "organizer")

        await gotoBackofficePage(page, "/backoffice/events/new")
        await fillEventEssentials(page, {
            title,
            categoryName: category.name,
            venueName: venue.name,
            date: "2026-11-14",
        })
        await clickButton(page, t("shared", "Backoffice.Actions.Save"))

        const message = t("shared", "Backoffice.EventEditor.Saved", { title })
        await expectToast(page, { type: "success" }, message)
        await dismissToast(page, { type: "success" }, message)
        await expect(page).toHaveURL(/\/backoffice\/events$/u)
        await expectTableRow(page, [
            ["exact", title],
            ["exact", venue.name],
            ["exact", t("shared", "Backoffice.Events.Single")],
        ])
    })

    test("creates a weekly event without one of its dates", async ({ page }) => {
        const category = await seedCategory()
        const venue = await seedVenue(buildArea())
        const title = `Weekly ${crypto.randomUUID()}`
        const { headers } = await signInBrowser(page, "organizer")

        await gotoBackofficePage(page, "/backoffice/events/new")
        await fillEventEssentials(page, {
            title,
            categoryName: category.name,
            venueName: venue.name,
            date: "2026-11-14",
        })
        await selectSelectItem(page, t("shared", "Backoffice.EventForm.Repeat"), [
            "exact",
            t("shared", "Backoffice.EventForm.Repeats.weekly"),
        ])
        await checkCheckbox(page, t("shared", "Backoffice.EventForm.Weekday.saturday"))
        await fillNativeDateInput(
            page,
            t("shared", "Backoffice.EventForm.Until"),
            "2026-12-05",
        )
        const preview = page.getByRole("region", {
            name: t("shared", "Backoffice.EventForm.Preview"),
        })
        await expect(preview).toContainText(
            t("shared", "Backoffice.EventForm.PreviewCount", { count: 4 }),
        )
        await clickButton(
            preview,
            t("shared", "Backoffice.EventForm.RemoveDate", { date: "2026-11-21" }),
        )
        await expect(preview).toContainText(
            t("shared", "Backoffice.EventForm.PreviewCount", { count: 3 }),
        )
        await clickButton(page, t("shared", "Backoffice.Actions.Save"))

        const message = t("shared", "Backoffice.EventEditor.Saved", { title })
        await expectToast(page, { type: "success" }, message)
        await dismissToast(page, { type: "success" }, message)
        await expectTableRow(page, [
            ["exact", title],
            ["exact", t("shared", "Backoffice.Events.Repeating")],
        ])
        const list = await listEvents({ headers, queryParams: { q: title } })
        expectStatus(list, 200)
        const id = list.data.items[0]?.id ?? ""
        const stored = await getEvent({ headers, pathParams: { id } })
        expectStatus(stored, 200)
        expect(stored.data.recurrence).toStrictEqual({
            rule: { frequency: "weekly", weekdays: ["saturday"], until: "2026-12-05" },
            addedDates: [],
            removedDates: ["2026-11-21"],
        })
    })
})
