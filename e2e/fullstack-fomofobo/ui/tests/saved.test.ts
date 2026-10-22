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

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)
        const toggle = page.getByRole("button", { name: t("shared", "Saved.Toggle") })
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

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)
        await context.setOffline(true)
        const toggle = page.getByRole("button", { name: t("shared", "Saved.Toggle") })
        await toggle.click()
        await expect(toggle).toHaveAttribute("aria-pressed", "true")
        await expectToast(page, { type: "success" }, t("shared", "Saved.Added"))
        await dismissToast(page, { type: "success" }, t("shared", "Saved.Added"))

        expect(await countOfSaturday()).toBe(0)

        await context.setOffline(false)

        await expect.poll(countOfSaturday).toBe(1)
    })
})
