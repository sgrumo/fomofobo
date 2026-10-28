import { expect, test } from "@playwright/test"
import { expectStatus } from "e2e-kit/assertions"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { signInAs } from "../../api/auth/utils"
import { listEventSaveCounts } from "../../api/backoffice-events/api"
import { SATURDAY_NOON } from "../../api/public/utils"
import { gotoPage, reloadPage, t } from "../app"
import {
    blockPublicEvent,
    buildArea,
    eventDetailPath,
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

        await gotoPage(page, eventDetailPath(event.id, "2026-10-24"))
        const toggle = page
            .getByRole("dialog", { name: event.title, exact: true })
            .getByRole("button", { name: t("shared", "Saved.Toggle") })
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

    test("opens a saved event over the list, in a side panel on a wide screen and in a sheet on a phone", async ({
        page,
    }) => {
        const event = await seedPublicEvent(
            { venue: await seedVenue(buildArea()), category: await seedCategory() },
            { startsAt: "2026-10-25T18:00", endsAt: "2026-10-25T20:00" },
        )

        await gotoPage(page, eventDetailPath(event.id, "2026-10-25"))
        await page
            .getByRole("dialog", { name: event.title, exact: true })
            .getByRole("button", { name: t("shared", "Saved.Toggle") })
            .click()
        await expectToast(page, { type: "success" }, t("shared", "Saved.Added"))
        await dismissToast(page, { type: "success" }, t("shared", "Saved.Added"))

        await gotoPage(page, "/saved/")
        const link = page
            .getByRole("listitem")
            .filter({ hasText: event.title })
            .getByRole("link")
        const detail = page.getByRole("dialog", { name: event.title, exact: true })
        await expect(link).toHaveAttribute(
            "href",
            `/it?event=${event.id}&occurrence=2026-10-25&detail=true`,
        )
        await link.click()

        await expect(detail).toBeFocused()
        await expect(detail).toContainText("25/10")
        await expect(detail).toContainText("18:00 → 20:00")
        await expect(page).toHaveURL(/\/saved\/?$/u)

        await page
            .getByRole("heading", { level: 1, name: t("shared", "PageTitle.Saved") })
            .click()

        await expect(detail).toBeHidden()

        await page.setViewportSize({ width: 375, height: 812 })
        await link.click()

        await expect(
            detail.getByRole("heading", { level: 1, name: event.title }),
        ).toBeVisible()
        await expect(page).toHaveURL(/\/saved\/?$/u)
    })

    test("sends a save made offline once the connection is back", async ({
        page,
        context,
    }) => {
        const event = await seedPublicEvent(
            { venue: await seedVenue(buildArea()), category: await seedCategory() },
            {},
        )
        const admin = await signInAs("admin")
        const countOfSaturday = async () => {
            const res = await listEventSaveCounts({
                headers: { ...admin.headers, "x-test-now": SATURDAY_NOON },
                pathParams: { id: event.id },
            })
            expectStatus(res, 200)
            return res.data.find(entry => entry.date === "2026-10-24")?.count
        }

        await gotoPage(page, eventDetailPath(event.id, "2026-10-24"))
        await context.setOffline(true)
        const toggle = page
            .getByRole("dialog", { name: event.title, exact: true })
            .getByRole("button", { name: t("shared", "Saved.Toggle") })
        await toggle.click()
        await expect(toggle).toHaveAttribute("aria-pressed", "true")
        await expectToast(page, { type: "success" }, t("shared", "Saved.Added"))
        await dismissToast(page, { type: "success" }, t("shared", "Saved.Added"))

        expect(await countOfSaturday()).toBe(0)

        await context.setOffline(false)

        await expect.poll(countOfSaturday).toBe(1)
    })
})
