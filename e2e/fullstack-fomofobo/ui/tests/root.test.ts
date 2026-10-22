import { expect, test } from "@playwright/test"
import { expectToBeDefined } from "e2e-kit/assertions"
import { expectAlert } from "e2e-ui-components/alert"
import { getBottomSheet } from "e2e-ui-components/bottom-sheet"
import { clickButton } from "e2e-ui-components/button"
import { getChip, pressChip, unpressChip } from "e2e-ui-components/chip"
import { pickDate } from "e2e-ui-components/date-input"
import { clickIconButton } from "e2e-ui-components/icon-button"
import { fillSearchField } from "e2e-ui-components/search-field"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { buildFreePriceScheme } from "../../api/backoffice-events/utils"
import { gotoPage, t } from "../app"
import {
    buildArea,
    mapPath,
    offsetPoint,
    preparePublicPage,
    seedCategory,
    seedPublicCinema,
    seedPublicEvent,
    seedVenue,
} from "../public"

// The map draws on the CPU in headless Chromium, so the first pin takes a while.
const MAP_TIMEOUT_MS = 20_000

test.describe("map", () => {
    test.beforeEach(async ({ page }) => {
        await preparePublicPage(page)
    })

    test("shows a pin per result, with the look of its status", async ({ page }) => {
        const center = buildArea()
        const category = await seedCategory()
        const live = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.02, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
        )
        const upcoming = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: -0.02, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const ended = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0, longitude: 0.03 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T08:00", endsAt: "2026-10-24T09:00" },
        )

        await gotoPage(page, mapPath(center))

        for (const [event, status, time] of [
            [live, "live", "11:00"],
            [upcoming, "upcoming", "18:00"],
            [ended, "ended", "08:00"],
        ] as const) {
            await expect(
                page.getByRole("button", {
                    name: t("shared", "Map.Pin", {
                        title: event.title,
                        status: t("shared", `Status.${status}`),
                        time,
                    }),
                }),
            ).toBeVisible({ timeout: MAP_TIMEOUT_MS })
        }
    })

    test("merges the results of one venue into a cluster that counts them per status", async ({
        page,
    }) => {
        const center = buildArea()
        const venue = await seedVenue(
            offsetPoint(center, { latitude: 0.01, longitude: 0 }),
        )
        const category = await seedCategory()
        for (const times of [
            { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
            { startsAt: "2026-10-24T08:00", endsAt: "2026-10-24T09:00" },
        ]) {
            await seedPublicEvent({ venue, category }, times)
        }
        await seedPublicCinema(venue.coordinates, category)

        await gotoPage(page, mapPath(center))

        await expect(
            page.getByRole("button", {
                name: t("shared", "Map.Cluster", {
                    count: 4,
                    live: 1,
                    upcoming: 1,
                    ended: 1,
                    permanent: 1,
                }),
            }),
        ).toBeVisible({ timeout: MAP_TIMEOUT_MS })
    })

    test("shows a cinema under any date filter, and opens its programme and its page from the preview", async ({
        page,
    }) => {
        const center = buildArea()
        const cinema = await seedPublicCinema(
            offsetPoint(center, { latitude: 0.01, longitude: 0 }),
            await seedCategory(),
        )

        await gotoPage(page, `${mapPath(center)}&date=tomorrow`)
        await page
            .getByRole("button", {
                name: t("shared", "Map.VenuePin", {
                    name: cinema.name,
                    kind: t("shared", "VenueKind.cinema"),
                }),
            })
            .click({ timeout: MAP_TIMEOUT_MS })

        const preview = getBottomSheet(page, cinema.name)
        expectToBeDefined(cinema.programmeUrl)
        await expect(preview).toContainText(t("shared", "VenueKind.cinema"))
        await expect(
            preview.getByRole("link", { name: t("shared", "Preview.Programme") }),
        ).toHaveAttribute("href", cinema.programmeUrl)
        await preview
            .getByRole("link", { name: t("shared", "Preview.OpenVenue") })
            .click()

        await expect(page).toHaveURL(`/it/venues/${cinema.id}`)
        await expect(
            page.getByRole("heading", { level: 1, name: cinema.name }),
        ).toBeVisible()
    })

    test("opens the live event of a cinema first, then pages to the cinema", async ({
        page,
    }) => {
        const center = buildArea()
        const category = await seedCategory()
        const cinema = await seedPublicCinema(
            offsetPoint(center, { latitude: 0.01, longitude: 0 }),
            category,
        )
        const screening = await seedPublicEvent(
            { venue: cinema, category },
            { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
        )

        await gotoPage(page, mapPath(center))
        await page
            .getByRole("button", {
                name: t("shared", "Map.Cluster", {
                    count: 2,
                    live: 1,
                    upcoming: 0,
                    ended: 0,
                    permanent: 1,
                }),
            })
            .click({ timeout: MAP_TIMEOUT_MS })

        await expect(getBottomSheet(page, screening.title)).toContainText(
            t("shared", "Preview.Position", { index: 1, total: 2 }),
        )
        await clickIconButton(page, t("shared", "Preview.Next"))

        const preview = getBottomSheet(page, cinema.name)
        await expect(preview).toContainText(
            t("shared", "Preview.Position", { index: 2, total: 2 }),
        )
        await expect(
            preview.getByRole("link", { name: t("shared", "Preview.Programme") }),
        ).toBeVisible()
    })

    test("narrows the pins to the pressed category, with the count of each chip, and shows every category again once unpressed", async ({
        page,
    }) => {
        const center = buildArea()
        const concerts = await seedCategory()
        const markets = await seedCategory()
        const concert = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.02, longitude: 0 }),
                ),
                category: concerts,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const market = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: -0.02, longitude: 0 }),
                ),
                category: markets,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const concertPin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: concert.title,
                status: t("shared", "Status.upcoming"),
                time: "18:00",
            }),
        })
        const marketPin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: market.title,
                status: t("shared", "Status.upcoming"),
                time: "18:00",
            }),
        })

        await gotoPage(page, mapPath(center))
        await expect(marketPin).toBeVisible({ timeout: MAP_TIMEOUT_MS })
        await expect(getChip(page, `${markets.name} 1`)).toBeVisible()

        await pressChip(page, `${concerts.name} 1`)

        await expect(concertPin).toBeVisible()
        await expect(marketPin).toBeHidden()
        await expect(page).toHaveURL(new RegExp(`category=${concerts.id}`, "u"))

        await unpressChip(page, `${concerts.name} 1`)

        await expect(concertPin).toBeVisible()
        await expect(marketPin).toBeVisible()
        await expect(page).not.toHaveURL(/category=/u)
    })

    test("opens the filters from the filter button on a phone", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 })
        const center = buildArea()
        const category = await seedCategory()
        const today = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.02, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const tomorrow = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: -0.02, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-25T18:00", endsAt: "2026-10-25T20:00" },
        )
        const todayPin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: today.title,
                status: t("shared", "Status.upcoming"),
                time: "18:00",
            }),
        })
        const tomorrowPin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: tomorrow.title,
                status: t("shared", "Status.upcoming"),
                time: "25/10 18:00",
            }),
        })
        const tomorrowChip = getChip(page, t("shared", "Filters.tomorrow"))

        await gotoPage(page, mapPath(center))
        await expect(todayPin).toBeVisible({ timeout: MAP_TIMEOUT_MS })
        await expect(tomorrowChip).toBeHidden()

        await clickIconButton(page, t("shared", "Filters.Label"))
        await pressChip(page, t("shared", "Filters.tomorrow"))

        await expect(tomorrowPin).toBeVisible()
        await expect(todayPin).toBeHidden()

        await clickIconButton(page, t("shared", "Filters.Label"))

        await expect(tomorrowChip).toBeHidden()
        await expect(tomorrowPin).toBeVisible()
    })

    test("keeps tomorrow's results alone under the tomorrow chip, with the date on their pins", async ({
        page,
    }) => {
        const center = buildArea()
        const category = await seedCategory()
        const today = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.02, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const tomorrow = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: -0.02, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-25T18:00", endsAt: "2026-10-25T20:00" },
        )
        const todayPin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: today.title,
                status: t("shared", "Status.upcoming"),
                time: "18:00",
            }),
        })
        const tomorrowPin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: tomorrow.title,
                status: t("shared", "Status.upcoming"),
                time: "25/10 18:00",
            }),
        })

        await gotoPage(page, mapPath(center))
        await expect(todayPin).toBeVisible({ timeout: MAP_TIMEOUT_MS })

        await pressChip(page, t("shared", "Filters.tomorrow"))

        await expect(tomorrowPin).toBeVisible()
        await expect(todayPin).toBeHidden()
    })

    test("keeps the results of a custom range picked in the sheet", async ({ page }) => {
        const center = buildArea()
        const category = await seedCategory()
        const today = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.02, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const monday = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: -0.02, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-26T18:00", endsAt: "2026-10-26T20:00" },
        )
        const todayPin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: today.title,
                status: t("shared", "Status.upcoming"),
                time: "18:00",
            }),
        })
        const mondayPin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: monday.title,
                status: t("shared", "Status.upcoming"),
                time: "26/10 18:00",
            }),
        })

        await gotoPage(page, mapPath(center))
        await expect(todayPin).toBeVisible({ timeout: MAP_TIMEOUT_MS })

        await getChip(page, t("shared", "Filters.Range")).click()
        const sheet = getBottomSheet(page, t("shared", "Filters.RangeTitle"))
        await pickDate(sheet, t("shared", "Filters.From"), {
            year: 2026,
            month: 10,
            day: 25,
        })
        await pickDate(sheet, t("shared", "Filters.To"), {
            year: 2026,
            month: 10,
            day: 26,
        })
        await clickButton(sheet, t("shared", "Filters.Apply"))

        await expect(getChip(page, "25/10–26/10")).toHaveAttribute("aria-pressed", "true")
        await expect(mondayPin).toBeVisible()
        await expect(todayPin).toBeHidden()
    })

    test("moves the center and the results to a suggested place", async ({ page }) => {
        const center = buildArea()
        const text = `Teatro ${crypto.randomUUID().slice(0, 8)}`
        // The geocoding mock answers a second place 0.1° north of the bias, which the
        // service rounds to two decimals.
        const farPlace = {
            latitude: Math.round(center.latitude * 100) / 100 + 0.1,
            longitude: Math.round(center.longitude * 100) / 100,
        }
        const farEvent = await seedPublicEvent(
            { venue: await seedVenue(farPlace), category: await seedCategory() },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const farPin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: farEvent.title,
                status: t("shared", "Status.upcoming"),
                time: "18:00",
            }),
        })

        await gotoPage(page, mapPath(center))
        await expect(farPin).toBeHidden()

        await fillSearchField(page, t("shared", "Search.Label"), text)
        await page.getByRole("button", { name: `${text}, Bologna, Italy` }).click()

        await expect(page).toHaveURL(/place=/u)
        await expect(farPin).toBeVisible({ timeout: MAP_TIMEOUT_MS })
    })

    test("opens the page of a venue of the area that the search names, in the group of its kind", async ({
        page,
    }) => {
        const center = buildArea()
        const category = await seedCategory()
        for (const [venue, group] of [
            [await seedVenue(center), t("shared", "Search.Venues")],
            [
                await seedPublicCinema(center, category),
                t("shared", "Search.PermanentVenues"),
            ],
        ] as const) {
            await gotoPage(page, mapPath(center))
            await fillSearchField(page, t("shared", "Search.Label"), venue.name)
            await page
                .getByRole("region", { name: group })
                .getByRole("link", { name: venue.name })
                .click()

            await expect(page).toHaveURL(`/it/venues/${venue.id}`)
            await expect(
                page.getByRole("heading", { level: 1, name: venue.name }),
            ).toBeVisible()
        }
    })

    test("asks for a place search when location is denied, and offers to allow it", async ({
        page,
        context,
    }) => {
        await context.grantPermissions([])

        await gotoPage(page, "/")

        await expectAlert(page, { type: "info", text: t("shared", "Map.LocationOff") })
        await clickButton(page, t("shared", "Map.AllowLocation"))
        const blocked = { title: t("shared", "Map.LocationBlocked.Title") }
        const howTo = t("shared", "Map.LocationBlocked.Description")
        await expectToast(page, blocked, howTo)
        await dismissToast(page, blocked, howTo)

        const position = buildArea()
        await context.grantPermissions(["geolocation"])
        await context.setGeolocation(position)
        await clickButton(page, t("shared", "Map.AllowLocation"))

        await expect(page).toHaveURL(
            new RegExp(
                `lat=${String(position.latitude)}&lng=${String(position.longitude)}`,
                "u",
            ),
        )
    })

    test("centers on the position of the device when location is granted", async ({
        page,
        context,
    }) => {
        const position = buildArea()
        const event = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(position, { latitude: 0.01, longitude: 0 }),
                ),
                category: await seedCategory(),
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        await context.grantPermissions(["geolocation"])
        await context.setGeolocation(position)

        await gotoPage(page, "/")

        await expect(page).toHaveURL(
            new RegExp(
                `lat=${String(position.latitude)}&lng=${String(position.longitude)}`,
                "u",
            ),
        )
        await expect(
            page.getByRole("button", {
                name: t("shared", "Map.Pin", {
                    title: event.title,
                    status: t("shared", "Status.upcoming"),
                    time: "18:00",
                }),
            }),
        ).toBeVisible({ timeout: MAP_TIMEOUT_MS })
        await expect(
            page.getByRole("img", { name: t("shared", "Map.Position") }),
        ).toBeVisible()
    })

    test("keeps the center of a shared link, and the locate button moves it to the device", async ({
        page,
        context,
    }) => {
        const sharedCenter = buildArea()
        const position = buildArea()
        const nearby = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(position, { latitude: 0.01, longitude: 0 }),
                ),
                category: await seedCategory(),
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        await context.grantPermissions(["geolocation"])
        await context.setGeolocation(position)

        await gotoPage(page, mapPath(sharedCenter))
        await expect(
            page.getByRole("img", { name: t("shared", "Map.Position") }),
        ).toBeAttached({
            timeout: MAP_TIMEOUT_MS,
        })
        await expect(page).toHaveURL(
            new RegExp(
                `lat=${String(sharedCenter.latitude)}&lng=${String(sharedCenter.longitude)}`,
                "u",
            ),
        )

        await clickIconButton(page, t("shared", "Map.Locate"))

        await expect(page).toHaveURL(
            new RegExp(
                `lat=${String(position.latitude)}&lng=${String(position.longitude)}`,
                "u",
            ),
        )
        await expect(
            page.getByRole("button", {
                name: t("shared", "Map.Pin", {
                    title: nearby.title,
                    status: t("shared", "Status.upcoming"),
                    time: "18:00",
                }),
            }),
        ).toBeVisible({ timeout: MAP_TIMEOUT_MS })
    })

    test("opens the preview of a pin, free when it has no price, and its page", async ({
        page,
    }) => {
        const center = buildArea()
        const event = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.01, longitude: 0 }),
                ),
                category: await seedCategory(),
            },
            {
                startsAt: "2026-10-24T11:00",
                endsAt: "2026-10-24T13:00",
                priceScheme: buildFreePriceScheme(),
            },
        )

        await gotoPage(page, mapPath(center))
        await page
            .getByRole("button", {
                name: t("shared", "Map.Pin", {
                    title: event.title,
                    status: t("shared", "Status.live"),
                    time: "11:00",
                }),
            })
            .click({ timeout: MAP_TIMEOUT_MS })

        const preview = getBottomSheet(page, event.title)
        await expect(preview).toBeVisible()
        await expect(preview).toContainText(t("shared", "Price.Free"), {
            ignoreCase: true,
        })
        await preview.getByRole("link", { name: t("shared", "Preview.Open") }).click()

        await expect(
            page.getByRole("heading", { level: 1, name: event.title }),
        ).toBeVisible()
    })
})
