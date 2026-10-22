import { expect, test } from "@playwright/test"
import { expectStatus } from "e2e-kit/assertions"
import { clickIconButton } from "e2e-ui-components/icon-button"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { signInAs } from "../../api/auth/utils"
import { blockVenue } from "../../api/backoffice-venues/api"
import { gotoPage, gotoPath, reloadPage, t } from "../app"
import {
    blockPublicEvent,
    buildArea,
    preparePublicPage,
    seedCategory,
    seedPublicEvent,
    seedVenue,
} from "../public"

test.describe("event detail", () => {
    test.beforeEach(async ({ page }) => {
        await preparePublicPage(page)
    })

    test("renders the occurrence on a direct load, and answers not found once it is hidden", async ({
        page,
    }) => {
        const venue = await seedVenue(buildArea())
        const event = await seedPublicEvent(
            { venue, category: await seedCategory() },
            { capacity: 120 },
        )

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)

        await expect(
            page.getByRole("heading", { level: 1, name: event.title }),
        ).toBeVisible()
        await expect(page.getByText(venue.address)).toBeVisible()
        await expect(page.getByText("10 €")).toBeVisible()
        await expect(
            page.getByText(t("shared", "Detail.Places_other", { count: 120 })),
        ).toBeVisible()
        await expect(
            page.getByRole("link", { name: t("shared", "Detail.Instagram") }),
        ).toHaveAttribute("href", "https://www.instagram.com/fomofobo")
        await expect(
            page.getByRole("link", { name: t("shared", "Detail.Directions") }),
        ).toHaveAttribute(
            "href",
            `https://www.google.com/maps/dir/?api=1&destination=${String(venue.coordinates.latitude)},${String(venue.coordinates.longitude)}`,
        )

        await blockPublicEvent(event.id)
        await reloadPage(page)

        await expect(page.getByText(t("shared", "NotFound.Title"))).toBeVisible()
    })

    test("links the venue to its page, and names it alone once the venue is blocked", async ({
        page,
    }) => {
        const venue = await seedVenue(buildArea())
        const event = await seedPublicEvent({ venue, category: await seedCategory() }, {})
        const admin = await signInAs("admin")

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)
        await page.getByRole("link", { name: venue.name }).click()

        await expect(page).toHaveURL(`/it/venues/${venue.id}`)
        await expect(
            page.getByRole("heading", { level: 1, name: venue.name }),
        ).toBeVisible()

        expectStatus(
            await blockVenue({
                headers: admin.headers,
                pathParams: { id: venue.id },
                body: { reason: "Closed for works" },
            }),
            200,
        )
        await gotoPage(page, `/events/${event.id}/2026-10-24/`)

        await expect(page.getByText(venue.name)).toBeVisible()
        await expect(page.getByRole("link", { name: venue.name })).toHaveCount(0)
    })

    test("describes the occurrence for a shared link", async ({ page, baseURL }) => {
        const venue = await seedVenue(buildArea())
        const event = await seedPublicEvent(
            { venue, category: await seedCategory() },
            { description: null },
        )

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)

        const meta = (key: string) => page.locator(`head meta[${key}]`)
        await expect(meta('property="og:title"')).toHaveAttribute("content", event.title)
        await expect(meta('property="og:description"')).toHaveAttribute(
            "content",
            `sab 24/10 · 21:00 · ${venue.name}`,
        )
        await expect(meta('property="og:url"')).toHaveAttribute(
            "content",
            `${String(baseURL)}/it/events/${event.id}/2026-10-24`,
        )
        await expect(meta('property="og:image"')).toHaveAttribute(
            "content",
            /^https?:\/\//u,
        )
        await expect(meta('name="twitter:card"')).toHaveAttribute(
            "content",
            "summary_large_image",
        )
    })

    test("links each share target to the page, and copies the link", async ({
        page,
        context,
        baseURL,
    }) => {
        const event = await seedPublicEvent(
            { venue: await seedVenue(buildArea()), category: await seedCategory() },
            {},
        )
        const pageUrl = `${String(baseURL)}/it/events/${event.id}/2026-10-24`
        await context.grantPermissions(["clipboard-read", "clipboard-write"])

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)

        for (const [target, host] of [
            ["whatsapp", "https://wa.me/"],
            ["telegram", "https://t.me/share/url"],
            ["facebook", "https://www.facebook.com/sharer/sharer.php"],
            ["x", "https://x.com/intent/tweet"],
        ] as const) {
            const link = page.getByRole("link", {
                name: t("shared", `Detail.ShareOn.${target}`),
            })
            await expect(link).toHaveAttribute("href", new RegExp(`^${host}`, "u"))
            expect(await link.getAttribute("href")).toContain(encodeURIComponent(pageUrl))
        }

        await clickIconButton(page, t("shared", "Detail.ShareOn.Copy"))

        await expectToast(page, { type: "success" }, t("shared", "Detail.LinkCopied"))
        await dismissToast(page, { type: "success" }, t("shared", "Detail.LinkCopied"))
        // A string expression: the suite compiles without the DOM types of the browser.
        expect(await page.evaluate("navigator.clipboard.readText()")).toBe(pageUrl)
    })

    test("opens an old English link in Italian", async ({ page }) => {
        const event = await seedPublicEvent(
            { venue: await seedVenue(buildArea()), category: await seedCategory() },
            {},
        )

        await gotoPath(page, `/en/events/${event.id}/2026-10-24/`)

        await expect(page).toHaveURL(`/it/events/${event.id}/2026-10-24`)
        await expect(
            page.getByRole("heading", { level: 1, name: event.title }),
        ).toBeVisible()
    })

    test("copies the link where the browser has no share sheet", async ({
        page,
        context,
    }) => {
        const event = await seedPublicEvent(
            { venue: await seedVenue(buildArea()), category: await seedCategory() },
            {},
        )
        await context.grantPermissions(["clipboard-read", "clipboard-write"])
        await page.addInitScript(() => {
            Reflect.deleteProperty(Navigator.prototype, "share")
            Reflect.deleteProperty(Navigator.prototype, "canShare")
        })

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)
        await clickIconButton(page, t("shared", "Detail.Share"))

        await expectToast(page, { type: "success" }, t("shared", "Detail.LinkCopied"))
        await dismissToast(page, { type: "success" }, t("shared", "Detail.LinkCopied"))
        // A string expression: the suite compiles without the DOM types of the browser.
        expect(await page.evaluate("navigator.clipboard.readText()")).toBe(page.url())
    })
})
