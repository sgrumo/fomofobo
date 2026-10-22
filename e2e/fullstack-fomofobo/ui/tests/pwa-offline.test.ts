import { expect, test } from "@playwright/test"
import { expectAlert } from "e2e-ui-components/alert"
import { pressChip } from "e2e-ui-components/chip"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { gotoBackofficePage, gotoPage, reloadPage, t } from "../app"
import {
    buildArea,
    mapPath,
    preparePublicPage,
    seedCategory,
    seedPublicEvent,
    seedVenue,
} from "../public"

const MAP_TIMEOUT_MS = 20_000

test.describe("installed app offline", () => {
    // The kit blocks workers for every other spec.
    test.use({ serviceWorkers: "allow" })

    test.beforeEach(async ({ page }) => {
        await preparePublicPage(page)
    })

    test("serves a manifest that installs the map full-screen", async ({ request }) => {
        const res = await request.get("/manifest.webmanifest")

        expect(res.status()).toBe(200)
        const manifest: unknown = await res.json()
        expect(manifest).toMatchObject({
            name: "Fomofobo",
            display: "standalone",
            start_url: expect.stringMatching(/^\/[a-z]{2}$/u),
            icons: expect.arrayContaining([
                expect.objectContaining({ sizes: "192x192" }),
                expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
            ]),
        })
    })

    test("renders a loaded detail and its photo after an offline reload", async ({
        page,
        context,
    }) => {
        const venue = await seedVenue(buildArea())
        const event = await seedPublicEvent({ venue, category: await seedCategory() }, {})

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)
        await page.waitForFunction("navigator.serviceWorker.controller !== null")
        // The fake clock empties the resource timing that the first worker reads, so a
        // second load under the worker caches the page and its photo.
        await reloadPage(page)
        await expect
            .poll(() =>
                page.evaluate(
                    "Promise.all([location.href, document.images[0].currentSrc].map(url => caches.match(url))).then(cached => cached.every(Boolean))",
                ),
            )
            .toBe(true)

        await context.setOffline(true)
        const photo = page.waitForResponse(
            response =>
                response.request().resourceType() === "image" &&
                !response.url().startsWith(new URL(page.url()).origin),
        )
        await reloadPage(page)

        await expect(
            page.getByRole("heading", { level: 1, name: event.title }),
        ).toBeVisible()
        await expect(page.getByText(venue.address)).toBeVisible()
        const offlinePhoto = await photo
        // The photos bucket answers without CORS, so the copy is opaque: no status to read.
        expect(offlinePhoto.fromServiceWorker()).toBe(true)
    })

    test("renders a loaded venue page with its events after an offline reload", async ({
        page,
        context,
    }) => {
        const venue = await seedVenue(buildArea())
        const category = await seedCategory()
        const upcoming = await seedPublicEvent({ venue, category }, {})
        const past = await seedPublicEvent(
            { venue, category },
            { startsAt: "2026-10-20T21:00", endsAt: "2026-10-20T23:30" },
        )

        await gotoPage(page, `/venues/${venue.id}/`)
        await page.waitForFunction("navigator.serviceWorker.controller !== null")
        // A second load under the worker caches the page, as on the event page.
        await reloadPage(page)
        await expect
            .poll(() => page.evaluate("caches.match(location.href).then(Boolean)"))
            .toBe(true)

        await context.setOffline(true)
        await reloadPage(page)

        await expect(
            page.getByRole("heading", { level: 1, name: venue.name }),
        ).toBeVisible()
        await expect(page.getByText(upcoming.title)).toBeVisible()
        await expect(page.getByText(past.title)).toBeVisible()
    })

    test("names the missing connection when a new filter cannot load offline", async ({
        page,
        context,
    }) => {
        const center = buildArea()
        const event = await seedPublicEvent(
            { venue: await seedVenue(center), category: await seedCategory() },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const pin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: event.title,
                status: t("shared", "Status.upcoming"),
                time: "18:00",
            }),
        })

        await gotoPage(page, mapPath(center))
        await expect(pin).toBeVisible({ timeout: MAP_TIMEOUT_MS })
        await page.waitForFunction("navigator.serviceWorker.controller !== null")

        await context.setOffline(true)
        await expectAlert(page, { type: "warning", text: t("shared", "Map.Offline") })
        await pressChip(page, t("shared", "Filters.tomorrow"))

        await expectAlert(page, {
            type: "error",
            text: t("shared", "Map.NeedsConnection"),
        })
        // The last results stay on the map.
        await expect(pin).toBeVisible()
    })

    test("leaves the backoffice to the network", async ({ page, context }) => {
        await gotoPage(page, "/")
        await page.waitForFunction("navigator.serviceWorker.controller !== null")

        const login = page.waitForResponse(response =>
            new URL(response.url()).pathname.startsWith("/backoffice/login"),
        )
        await gotoBackofficePage(page, "/backoffice/login")
        const online = await login

        expect(online.status()).toBe(200)
        expect(online.fromServiceWorker()).toBe(false)

        await context.setOffline(true)

        await expect(gotoBackofficePage(page, "/backoffice/login")).rejects.toThrow(
            /ERR_INTERNET_DISCONNECTED/u,
        )
    })

    test("lists an opened saved event on the saved screen offline", async ({
        page,
        context,
    }) => {
        const event = await seedPublicEvent(
            { venue: await seedVenue(buildArea()), category: await seedCategory() },
            {},
        )

        await gotoPage(page, `/events/${event.id}/2026-10-24/`)
        await page.waitForFunction("navigator.serviceWorker.controller !== null")
        await page.getByRole("button", { name: t("shared", "Saved.Toggle") }).click()
        await expectToast(page, { type: "success" }, t("shared", "Saved.Added"))
        await dismissToast(page, { type: "success" }, t("shared", "Saved.Added"))

        await context.setOffline(true)
        // The trailing-slash redirect of Next needs the network. App links never carry the slash.
        await gotoPage(page, "/saved")

        await expectAlert(page, { type: "info", text: t("shared", "Saved.Offline") })
        await expect(
            page.getByRole("listitem").filter({ hasText: event.title }),
        ).toBeVisible()
    })
})
