import { expect, test } from "@playwright/test"
import { expectStatus, expectToBeDefined } from "e2e-kit/assertions"
import { expectAlert } from "e2e-ui-components/alert"
import { getBottomSheet } from "e2e-ui-components/bottom-sheet"
import { clickButton } from "e2e-ui-components/button"
import { getChip, pressChip, unpressChip } from "e2e-ui-components/chip"
import { pickDate } from "e2e-ui-components/date-input"
import { clickIconButton } from "e2e-ui-components/icon-button"
import { fillSearchField } from "e2e-ui-components/search-field"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { signInAs } from "../../api/auth/utils"
import { buildFreePriceScheme } from "../../api/backoffice-events/utils"
import { blockVenue, updateVenue } from "../../api/backoffice-venues/api"
import { saveOccurrence } from "../../api/public/api"
import { SATURDAY_NOON } from "../../api/public/utils"
import { gotoPage, gotoPath, t } from "../app"
import {
    blockPublicEvent,
    buildArea,
    eventDetailPath,
    mapPath,
    offsetPoint,
    preparePublicPage,
    seedCategory,
    seedPublicCinema,
    seedPublicEvent,
    seedVenue,
    venueDetailPath,
} from "../public"

// The map draws on the CPU in headless Chromium, so the first pin takes a while.
const MAP_TIMEOUT_MS = 20_000

test.describe("map", () => {
    test.beforeEach(async ({ page }) => {
        await preparePublicPage(page)
    })

    test("shows a pin per live and upcoming result with the look of its status, and the ended ones once their chip is pressed", async ({
        page,
    }) => {
        const center = buildArea()
        const category = await seedCategory()
        const live = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.005, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
        )
        const upcoming = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: -0.005, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const ended = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0, longitude: 0.0075 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T08:00", endsAt: "2026-10-24T09:00" },
        )

        const pinOf = (
            title: string,
            status: "live" | "upcoming" | "ended",
            time: string,
        ) =>
            page.getByRole("button", {
                name: t("shared", "Map.Pin", {
                    title,
                    status: t("shared", `Status.${status}`),
                    time,
                }),
            })

        await gotoPage(page, mapPath(center))

        await expect(pinOf(live.title, "live", "11:00")).toBeVisible({
            timeout: MAP_TIMEOUT_MS,
        })
        await expect(pinOf(upcoming.title, "upcoming", "18:00")).toBeVisible()
        await expect(pinOf(ended.title, "ended", "08:00")).toBeHidden()

        await pressChip(page, t("shared", "Filters.Kind.ended"))
        await expect(pinOf(ended.title, "ended", "08:00")).toBeVisible()
        await expect(page).toHaveURL(/show-ended=true/u)

        await unpressChip(page, t("shared", "Filters.Kind.live"))
        await expect(pinOf(live.title, "live", "11:00")).toBeHidden()
        await expect(pinOf(upcoming.title, "upcoming", "18:00")).toBeVisible()
    })

    test("draws one pin per venue, its live event with the count of the other results", async ({
        page,
    }) => {
        const center = buildArea()
        const venue = await seedVenue(
            offsetPoint(center, { latitude: 0.005, longitude: 0 }),
        )
        const category = await seedCategory()
        const [, live] = await Promise.all(
            [
                { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
                { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
                { startsAt: "2026-10-24T08:00", endsAt: "2026-10-24T09:00" },
            ].map(times => seedPublicEvent({ venue, category }, times)),
        )

        await gotoPage(page, mapPath(center, ["ended"]))

        expectToBeDefined(live)
        await expect(
            page.getByRole("button", {
                name: `${t("shared", "Map.Pin", {
                    title: live.title,
                    status: t("shared", "Status.live"),
                    time: "11:00",
                })}, ${t("shared", "Map.MoreHere_other", { count: 2 })}`,
                exact: true,
            }),
        ).toBeVisible({ timeout: MAP_TIMEOUT_MS })
    })

    test("merges close venues into a cluster that counts them by the top status of each", async ({
        page,
    }) => {
        const center = buildArea()
        const category = await seedCategory()
        const [busy, quiet] = await Promise.all([
            seedVenue(offsetPoint(center, { latitude: 0.005, longitude: 0 })),
            seedVenue(offsetPoint(center, { latitude: 0.0055, longitude: 0 })),
        ])
        await Promise.all([
            seedPublicEvent(
                { venue: busy, category },
                { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
            ),
            seedPublicEvent(
                { venue: busy, category },
                { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
            ),
            seedPublicEvent(
                { venue: quiet, category },
                { startsAt: "2026-10-24T08:00", endsAt: "2026-10-24T09:00" },
            ),
        ])

        await gotoPage(page, mapPath(center, ["ended"]))

        await expect(
            page.getByRole("button", {
                name: t("shared", "Map.Cluster", {
                    count: 2,
                    live: 1,
                    upcoming: 0,
                    ended: 1,
                    permanent: 0,
                }),
            }),
        ).toBeVisible({ timeout: MAP_TIMEOUT_MS })
    })

    test("keeps the free events alone under the free chip, and every event again once unpressed", async ({
        page,
    }) => {
        const center = buildArea()
        const category = await seedCategory()
        const times = { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" }
        const [free, paid] = await Promise.all([
            seedPublicEvent(
                {
                    venue: await seedVenue(
                        offsetPoint(center, { latitude: 0.005, longitude: 0 }),
                    ),
                    category,
                },
                { ...times, priceScheme: buildFreePriceScheme() },
            ),
            seedPublicEvent(
                {
                    venue: await seedVenue(
                        offsetPoint(center, { latitude: -0.005, longitude: 0 }),
                    ),
                    category,
                },
                times,
            ),
        ])
        const pinOf = (title: string) =>
            page.getByRole("button", {
                name: t("shared", "Map.Pin", {
                    title,
                    status: t("shared", "Status.upcoming"),
                    time: "18:00",
                }),
            })

        await gotoPage(page, mapPath(center))
        await expect(pinOf(paid.title)).toBeVisible({ timeout: MAP_TIMEOUT_MS })
        await pressChip(page, t("shared", "Price.Free"))

        await expect(page).toHaveURL(/free=true/u)
        await expect(pinOf(free.title)).toBeVisible({ timeout: MAP_TIMEOUT_MS })
        await expect(pinOf(paid.title)).toBeHidden()

        await unpressChip(page, t("shared", "Price.Free"))

        await expect(pinOf(paid.title)).toBeVisible({ timeout: MAP_TIMEOUT_MS })
    })

    test("shows a cinema under any date filter, and opens its detail with the programme from the preview", async ({
        page,
    }) => {
        const center = buildArea()
        const cinema = await seedPublicCinema(
            offsetPoint(center, { latitude: 0.005, longitude: 0 }),
            await seedCategory(),
        )

        await gotoPage(page, `${mapPath(center, ["permanent"])}&date=tomorrow`)
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
        await expect(preview).toContainText(
            t("shared", "Venue.ClosedOn", { days: t("shared", "Weekday.monday") }),
            { ignoreCase: true },
        )
        await expect(
            preview.getByRole("link", { name: t("shared", "Preview.Programme") }),
        ).toBeHidden()
        await clickIconButton(preview, t("shared", "Preview.OpenVenue"))

        const detail = page
            .getByRole("dialog", { name: cinema.name, exact: true })
            .filter({ has: page.getByRole("heading", { level: 1, name: cinema.name }) })
        await expect(detail).toBeVisible()
        await expect(page).toHaveURL(/detail=true/u)
        await expect(
            detail.getByText(t("shared", "VenueKind.cinema"), { exact: true }),
        ).toBeVisible()
        await expect(
            detail.getByRole("link", { name: t("shared", "Preview.Programme") }),
        ).toHaveAttribute("href", cinema.programmeUrl)
    })

    test("opens the live event of a cinema first, then pages to the cinema", async ({
        page,
    }) => {
        const center = buildArea()
        const category = await seedCategory()
        const cinema = await seedPublicCinema(
            offsetPoint(center, { latitude: 0.005, longitude: 0 }),
            category,
        )
        const screening = await seedPublicEvent(
            { venue: cinema, category },
            { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
        )

        await gotoPage(page, mapPath(center, ["permanent"]))
        await page
            .getByRole("button", {
                name: `${t("shared", "Map.Pin", {
                    title: screening.title,
                    status: t("shared", "Status.live"),
                    time: "11:00",
                })}, ${t("shared", "Map.MoreHere_one", { count: 1 })}`,
                exact: true,
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
        await expect(preview).toContainText(t("shared", "VenueKind.cinema"))
    })

    test("joins venues too close to tell apart in one pin, whose preview pages through the events of both", async ({
        page,
    }) => {
        const center = buildArea()
        const category = await seedCategory()
        const [courtyard, loggia] = await Promise.all([
            seedVenue(offsetPoint(center, { latitude: 0.005, longitude: 0 })),
            seedVenue(offsetPoint(center, { latitude: 0.00502, longitude: 0.00002 })),
        ])
        const [live, upcoming] = await Promise.all([
            seedPublicEvent(
                { venue: courtyard, category },
                { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
            ),
            seedPublicEvent(
                { venue: loggia, category },
                { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
            ),
        ])

        await gotoPage(page, mapPath(center))
        await page
            .getByRole("button", {
                name: `${t("shared", "Map.Pin", {
                    title: live.title,
                    status: t("shared", "Status.live"),
                    time: "11:00",
                })}, ${t("shared", "Map.MoreHere_one", { count: 1 })}`,
                exact: true,
            })
            .click({ timeout: MAP_TIMEOUT_MS })

        await expect(getBottomSheet(page, live.title)).toContainText(
            t("shared", "Preview.Position", { index: 1, total: 2 }),
        )
        await clickIconButton(page, t("shared", "Preview.Next"))

        await expect(getBottomSheet(page, upcoming.title)).toContainText(
            t("shared", "Preview.Position", { index: 2, total: 2 }),
        )
    })

    test("narrows the pins to any pressed category, and shows every category again once unpressed", async ({
        page,
    }) => {
        const center = buildArea()
        const concerts = await seedCategory()
        const markets = await seedCategory()
        const talks = await seedCategory()
        const concert = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.005, longitude: 0 }),
                ),
                category: concerts,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const market = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: -0.005, longitude: 0 }),
                ),
                category: markets,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const talk = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0, longitude: 0.0075 }),
                ),
                category: talks,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const talkPin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: talk.title,
                status: t("shared", "Status.upcoming"),
                time: "18:00",
            }),
        })
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
        await expect(getChip(page, markets.name)).toBeVisible()

        await pressChip(page, concerts.name)

        await expect(concertPin).toBeVisible()
        await expect(marketPin).toBeHidden()
        await expect(talkPin).toBeHidden()

        await pressChip(page, markets.name)

        await expect(concertPin).toBeVisible()
        await expect(marketPin).toBeVisible()
        await expect(talkPin).toBeHidden()
        await expect(page).toHaveURL(
            new RegExp(`categories=${concerts.id}%2C${markets.id}`, "u"),
        )

        await unpressChip(page, concerts.name)
        await unpressChip(page, markets.name)

        await expect(concertPin).toBeVisible()
        await expect(talkPin).toBeVisible()
        await expect(page).not.toHaveURL(/categories=/u)
    })

    test("keeps the kind chips in sight on a phone, opens the other filters from the filter button, and Escape closes them", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 375, height: 812 })
        const center = buildArea()
        const category = await seedCategory()
        const today = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.005, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const tomorrow = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: -0.005, longitude: 0 }),
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
        await expect(getChip(page, t("shared", "Filters.Kind.live"))).toBeVisible()

        await clickIconButton(page, t("shared", "Filters.Label"))
        await pressChip(page, t("shared", "Filters.tomorrow"))

        await expect(tomorrowPin).toBeVisible()
        await expect(todayPin).toBeHidden()

        await clickIconButton(page, t("shared", "Filters.Label"))

        await expect(tomorrowChip).toBeHidden()
        await expect(tomorrowPin).toBeVisible()

        await clickIconButton(page, t("shared", "Filters.Label"))
        await expect(tomorrowChip).toBeVisible()
        await page.keyboard.press("Escape")

        await expect(tomorrowChip).toBeHidden()
    })

    test("keeps tomorrow's results alone under the tomorrow chip, with the date on their pins", async ({
        page,
    }) => {
        const center = buildArea()
        const category = await seedCategory()
        const today = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.005, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const tomorrow = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: -0.005, longitude: 0 }),
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
                    offsetPoint(center, { latitude: 0.005, longitude: 0 }),
                ),
                category,
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const monday = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: -0.005, longitude: 0 }),
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

    test("moves to the first suggested place on Enter when no event or venue matches the text", async ({
        page,
    }) => {
        const text = `Piazza ${crypto.randomUUID().slice(0, 8)}`
        const searchField = page.getByLabel(t("shared", "Search.Label"))

        await gotoPage(page, mapPath(buildArea()))
        await fillSearchField(page, t("shared", "Search.Label"), text)
        await expect(
            page.getByRole("button", { name: `${text}, Imola, Italy` }),
        ).toBeVisible()
        await searchField.press("Enter")

        await expect(page).toHaveURL(/place=/u)
        // The search service lowercases the text that the geocoding mock echoes
        await expect(searchField).toHaveValue(`${text.toLowerCase()}, Imola, Italy`)
    })

    test("opens the detail of a venue of the area that the search names, in the group of its kind", async ({
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
                .getByRole("button", { name: venue.name })
                .click()

            await expect(
                page
                    .getByRole("dialog", { name: venue.name, exact: true })
                    .getByRole("heading", { level: 1, name: venue.name }),
            ).toBeVisible()
            await expect(page).toHaveURL(
                url =>
                    url.searchParams.get("venue") === venue.id &&
                    url.searchParams.get("detail") === "true",
            )
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
                    offsetPoint(position, { latitude: 0.005, longitude: 0 }),
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
                    offsetPoint(position, { latitude: 0.005, longitude: 0 }),
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

    test("opens the preview of a pin from the keyboard on a wide screen, and Escape gives the focus back to the pin", async ({
        page,
    }) => {
        const center = buildArea()
        const event = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.005, longitude: 0 }),
                ),
                category: await seedCategory(),
            },
            { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
        )

        await gotoPage(page, mapPath(center))
        const pin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: event.title,
                status: t("shared", "Status.live"),
                time: "11:00",
            }),
        })
        await pin.focus({ timeout: MAP_TIMEOUT_MS })
        await pin.press("Enter")

        const preview = page.getByRole("dialog", { name: event.title, exact: true })
        await expect(preview).toBeFocused()
        await preview.press("Escape")

        await expect(preview).toBeHidden()
        await expect(pin).toBeFocused()
    })

    test("closes the preview of a wide screen on a click on the map or on its pin, a filter, a drag of the map, and Escape with the focus outside it", async ({
        page,
    }) => {
        const center = buildArea()
        const event = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.005, longitude: 0 }),
                ),
                category: await seedCategory(),
            },
            { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
        )
        const pin = page.getByRole("button", {
            name: t("shared", "Map.Pin", {
                title: event.title,
                status: t("shared", "Status.live"),
                time: "11:00",
            }),
        })
        const preview = page.getByRole("dialog", { name: event.title, exact: true })

        await gotoPage(page, mapPath(center))
        await pin.click({ timeout: MAP_TIMEOUT_MS })
        await expect(preview).toBeVisible()
        // The left edge of the map, clear of the controls and of the pin at the center
        await page
            .getByRole("region", { name: t("shared", "Map.Label") })
            .click({ position: { x: 40, y: 400 } })

        await expect(preview).toBeHidden()
        await expect(page).not.toHaveURL(/event=/u)

        await pin.click()
        await expect(preview).toBeVisible()
        await pin.click()

        await expect(preview).toBeHidden()
        await expect(page).not.toHaveURL(/event=/u)

        await pin.click()
        await expect(preview).toBeVisible()
        await page.getByLabel(t("shared", "Search.Label")).focus()
        await page.keyboard.press("Escape")

        await expect(preview).toBeHidden()
        await expect(page).not.toHaveURL(/event=/u)

        await pin.click()
        await expect(preview).toBeVisible()
        await pressChip(page, t("shared", "Filters.Kind.ended"))

        await expect(preview).toBeHidden()
        await expect(page).not.toHaveURL(/event=/u)

        await pin.click()
        await expect(preview).toBeVisible()
        // The left edge of the map, clear of the controls and of the pin at the center
        await page.mouse.move(40, 400)
        await page.mouse.down()
        await page.mouse.move(140, 450, { steps: 5 })
        await page.mouse.up()

        await expect(preview).toBeHidden()
        await expect(page).not.toHaveURL(/event=/u)
    })

    test("opens the preview of a pin, free when it has no price, then its detail over the map, a side panel on a wide screen and a sheet on a phone", async ({
        page,
    }) => {
        const center = buildArea()
        const event = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.005, longitude: 0 }),
                ),
                category: await seedCategory(),
            },
            {
                startsAt: "2026-10-24T11:00",
                endsAt: "2026-10-24T13:00",
                priceScheme: buildFreePriceScheme(),
            },
        )
        const preview = page
            .getByRole("dialog", { name: event.title, exact: true })
            .filter({
                has: page.getByRole("button", { name: t("shared", "Preview.Open") }),
            })
        const detail = page
            .getByRole("dialog", { name: event.title, exact: true })
            .filter({ has: page.getByRole("heading", { level: 1, name: event.title }) })

        for (const viewport of [
            { width: 1280, height: 720 },
            { width: 375, height: 812 },
        ]) {
            await page.setViewportSize(viewport)
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

            await expect(preview).toContainText(t("shared", "Price.Free"), {
                ignoreCase: true,
            })
            await clickIconButton(preview, t("shared", "Preview.Open"))

            await expect(detail).toBeVisible()
            await expect(preview).toBeHidden()
            await expect(page).toHaveURL(/detail=true/u)

            await clickIconButton(detail, t("shared", "Detail.Back"))

            await expect(preview).toBeVisible()
            await expect(detail).toBeHidden()
            await expect(page).not.toHaveURL(/detail=/u)

            await clickIconButton(preview, t("shared", "Preview.Open"))
            await expect(detail).toBeVisible()
            await page.keyboard.press("Escape")

            await expect(detail).toBeHidden()
            await expect(preview).toBeHidden()
            await expect(page).not.toHaveURL(/event=/u)
        }
    })
})

test.describe("detail over the map", () => {
    test.beforeEach(async ({ page }) => {
        await preparePublicPage(page)
    })

    test("renders the occurrence of a shared link, with its prices, card and age", async ({
        page,
    }) => {
        const venue = await seedVenue(buildArea())
        const reducedLabel = `Under 18 ${crypto.randomUUID().slice(0, 8)}`
        const membershipName = `Tessera ${crypto.randomUUID()}`
        const event = await seedPublicEvent(
            { venue, category: await seedCategory() },
            {
                capacity: 120,
                priceScheme: {
                    isFree: false,
                    fullPriceCents: 1000,
                    reducedPrices: [{ label: reducedLabel, amountCents: 800 }],
                    membership: { name: membershipName, costCents: null },
                    minimumAge: 16,
                    notes: null,
                },
            },
        )

        await gotoPage(page, eventDetailPath(event.id, "2026-10-24"))

        const detail = page.getByRole("dialog", { name: event.title, exact: true })
        await expect(
            detail.getByRole("heading", { level: 1, name: event.title }),
        ).toBeVisible()
        await expect(detail.getByText(venue.address)).toBeVisible()
        await expect(
            detail.getByText(t("shared", "Detail.Places_other", { count: 120 })),
        ).toBeVisible()
        await expect(
            detail.getByText(
                `${t("shared", "Price.From", { price: "8 €" })} · ${t("shared", "Price.Membership")} · ${t("shared", "Price.MinimumAge", { age: 16 })}`,
            ),
        ).toBeVisible()
        const prices = detail.getByRole("region", {
            name: t("shared", "Detail.Prices.Label"),
        })
        await expect(prices).toContainText("10 €")
        await expect(prices).toContainText(reducedLabel)
        await expect(prices).toContainText(membershipName)
        await expect(prices).toContainText(t("shared", "Price.MinimumAge", { age: 16 }))
        await expect(
            detail.getByRole("link", { name: t("shared", "Detail.Instagram") }),
        ).toHaveAttribute("href", "https://www.instagram.com/fomofobo")
        await expect(
            detail.getByRole("link", { name: t("shared", "Detail.Directions") }),
        ).toHaveAttribute(
            "href",
            `https://www.google.com/maps/dir/?api=1&destination=${String(venue.coordinates.latitude)},${String(venue.coordinates.longitude)}`,
        )
    })

    test("shows the count of interested visitors once it reaches the threshold", async ({
        page,
    }) => {
        const event = await seedPublicEvent(
            { venue: await seedVenue(buildArea()), category: await seedCategory() },
            {},
        )
        // Above both thresholds the suite holds: the default, and the one the settings spec saves
        const saveCount = 40
        const client = {
            "x-test-now": SATURDAY_NOON,
            "x-forwarded-for": crypto.randomUUID(),
        }
        const responses = await Promise.all(
            Array.from({ length: saveCount }, () =>
                saveOccurrence({
                    headers: client,
                    pathParams: { eventId: event.id, date: "2026-10-24" },
                    body: { deviceId: crypto.randomUUID() },
                }),
            ),
        )
        for (const res of responses) {
            expectStatus(res, 204)
        }

        await gotoPage(page, eventDetailPath(event.id, "2026-10-24"))

        await expect(
            page
                .getByRole("dialog", { name: event.title, exact: true })
                .getByText(t("shared", "Detail.Interested_other", { count: saveCount })),
        ).toBeVisible()
    })

    test("shows the icon image of its category in place of the photos of an event with none", async ({
        page,
    }) => {
        const category = await seedCategory()
        const event = await seedPublicEvent(
            { venue: await seedVenue(buildArea()), category },
            { photoKeys: [] },
        )
        const iconImage = new RegExp(`/fallbacks/${category.icon}\\.png$`, "u")

        await gotoPage(page, eventDetailPath(event.id, "2026-10-24"))

        await expect(
            page.getByRole("img", {
                name: t("shared", "Detail.Cover", { title: event.title }),
            }),
        ).toHaveAttribute("src", iconImage)
        await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute(
            "content",
            iconImage,
        )
    })

    test("titles the page and describes the card of a shared link with the event or the venue it opens", async ({
        page,
        baseURL,
    }) => {
        const description = "Concerts in the cloister every Friday."
        const venue = await seedVenue(buildArea())
        const admin = await signInAs("admin")
        expectStatus(
            await updateVenue({
                headers: admin.headers,
                pathParams: { id: venue.id },
                body: { description },
            }),
            200,
        )
        const event = await seedPublicEvent(
            { venue, category: await seedCategory() },
            { description: null },
        )
        const meta = (key: string) => page.locator(`head meta[${key}]`)

        await gotoPage(page, eventDetailPath(event.id, "2026-10-24"))

        await expect.poll(() => page.title()).toContain(event.title)
        await expect(meta('property="og:title"')).toHaveAttribute("content", event.title)
        await expect(meta('property="og:description"')).toHaveAttribute(
            "content",
            `sab 24/10 · 21:00 · ${venue.name}`,
        )
        await expect(meta('property="og:url"')).toHaveAttribute(
            "content",
            `${String(baseURL)}/it?event=${event.id}&occurrence=2026-10-24&detail=true`,
        )
        await expect(meta('property="og:image"')).toHaveAttribute(
            "content",
            /^https?:\/\//u,
        )
        await expect(meta('name="twitter:card"')).toHaveAttribute(
            "content",
            "summary_large_image",
        )

        await gotoPage(page, venueDetailPath(venue.id))

        await expect.poll(() => page.title()).toContain(venue.name)
        await expect(meta('property="og:title"')).toHaveAttribute("content", venue.name)
        await expect(meta('property="og:description"')).toHaveAttribute(
            "content",
            description,
        )
    })

    test("links each share target to the map with the detail open, and copies the link where the browser has no share sheet", async ({
        page,
        context,
        baseURL,
    }) => {
        const event = await seedPublicEvent(
            { venue: await seedVenue(buildArea()), category: await seedCategory() },
            {},
        )
        const shareUrl = `${String(baseURL)}/it?event=${event.id}&occurrence=2026-10-24&detail=true`
        await context.grantPermissions(["clipboard-read", "clipboard-write"])
        await page.addInitScript(() => {
            Reflect.deleteProperty(Navigator.prototype, "share")
            Reflect.deleteProperty(Navigator.prototype, "canShare")
        })

        await gotoPage(page, eventDetailPath(event.id, "2026-10-24"))
        const detail = page.getByRole("dialog", { name: event.title, exact: true })

        for (const [target, host] of [
            ["whatsapp", "https://wa.me/"],
            ["telegram", "https://t.me/share/url"],
            ["facebook", "https://www.facebook.com/sharer/sharer.php"],
            ["x", "https://x.com/intent/tweet"],
        ] as const) {
            const link = detail.getByRole("link", {
                name: t("shared", `Detail.ShareOn.${target}`),
            })
            await expect(link).toHaveAttribute("href", new RegExp(`^${host}`, "u"))
            expect(await link.getAttribute("href")).toContain(
                encodeURIComponent(shareUrl),
            )
        }

        for (const control of [
            t("shared", "Detail.ShareOn.Copy"),
            t("shared", "Detail.Share"),
        ]) {
            await page.evaluate("navigator.clipboard.writeText('')")
            await clickIconButton(detail, control)

            await expectToast(page, { type: "success" }, t("shared", "Detail.LinkCopied"))
            await dismissToast(
                page,
                { type: "success" },
                t("shared", "Detail.LinkCopied"),
            )
            // A string expression: the suite compiles without the DOM types of the browser.
            expect(await page.evaluate("navigator.clipboard.readText()")).toBe(shareUrl)
        }
    })

    test("opens the venue detail from the venue of an event, back to its preview, and names a blocked venue alone", async ({
        page,
    }) => {
        const venue = await seedVenue(buildArea())
        const event = await seedPublicEvent({ venue, category: await seedCategory() }, {})
        const admin = await signInAs("admin")

        await gotoPage(page, eventDetailPath(event.id, "2026-10-24"))
        await page
            .getByRole("dialog", { name: event.title, exact: true })
            .getByRole("button", { name: venue.name })
            .click()

        const venueDetail = page
            .getByRole("dialog", { name: venue.name, exact: true })
            .filter({ has: page.getByRole("heading", { level: 1, name: venue.name }) })
        await expect(venueDetail).toBeVisible()
        await expect(page).toHaveURL(
            url =>
                url.searchParams.get("venue") === venue.id &&
                url.searchParams.get("detail") === "true" &&
                !url.searchParams.has("event"),
        )

        await clickIconButton(venueDetail, t("shared", "Detail.Back"))

        await expect(
            page
                .getByRole("dialog", { name: venue.name, exact: true })
                .getByRole("button", { name: t("shared", "Preview.OpenVenue") }),
        ).toBeVisible()
        await expect(page).not.toHaveURL(/detail=/u)

        expectStatus(
            await blockVenue({
                headers: admin.headers,
                pathParams: { id: venue.id },
                body: { reason: "Closed for works" },
            }),
            200,
        )
        await gotoPage(page, eventDetailPath(event.id, "2026-10-24"))

        const eventDetail = page.getByRole("dialog", { name: event.title, exact: true })
        await expect(eventDetail.getByText(venue.name)).toBeVisible()
        await expect(eventDetail.getByRole("button", { name: venue.name })).toHaveCount(0)
    })

    test("shows the profile of a venue, the past events, and opens the detail of an upcoming event", async ({
        page,
    }) => {
        const venue = await seedVenue(buildArea())
        const category = await seedCategory()
        const description = "Concerts in the cloister every Friday."
        const websiteUrl = "https://www.chiostro-imola.it"
        const admin = await signInAs("admin")
        expectStatus(
            await updateVenue({
                headers: admin.headers,
                pathParams: { id: venue.id },
                body: {
                    description,
                    links: { websiteUrl, instagramUrl: null, facebookUrl: null },
                },
            }),
            200,
        )
        const upcoming = await seedPublicEvent({ venue, category }, {})
        const past = await seedPublicEvent(
            { venue, category },
            { startsAt: "2026-10-20T21:00", endsAt: "2026-10-20T23:30" },
        )

        await gotoPage(page, venueDetailPath(venue.id))

        const detail = page.getByRole("dialog", { name: venue.name, exact: true })
        await expect(
            detail.getByRole("heading", { level: 1, name: venue.name }),
        ).toBeVisible()
        await expect(detail.getByText(venue.address)).toBeVisible()
        await expect(detail.getByText(description)).toBeVisible()
        await expect(
            detail.getByRole("link", { name: t("shared", "Venue.Website") }),
        ).toHaveAttribute("href", websiteUrl)
        await expect(
            detail.getByRole("link", { name: t("shared", "Detail.Directions") }),
        ).toHaveAttribute(
            "href",
            `https://www.google.com/maps/dir/?api=1&destination=${String(venue.coordinates.latitude)},${String(venue.coordinates.longitude)}`,
        )
        const history = detail.getByRole("region", { name: t("shared", "Venue.History") })
        await expect(history.getByText(past.title)).toBeVisible()
        await expect(history.getByText("20/10/2026")).toBeVisible()

        await detail
            .getByRole("region", { name: t("shared", "Venue.Upcoming") })
            .getByRole("button", { name: upcoming.title })
            .click()

        await expect(
            page
                .getByRole("dialog", { name: upcoming.title, exact: true })
                .getByRole("heading", { level: 1, name: upcoming.title }),
        ).toBeVisible()
        await expect(page).toHaveURL(
            url =>
                url.searchParams.get("event") === upcoming.id &&
                url.searchParams.get("occurrence") === "2026-10-24" &&
                url.searchParams.get("detail") === "true" &&
                !url.searchParams.has("venue"),
        )
    })

    test("loads more past events of a venue on demand", async ({ page }) => {
        const venue = await seedVenue(buildArea())
        const category = await seedCategory()
        // 21 past events, one a day from 1 to 21 September: the oldest alone is past the first load.
        const past = await Promise.all(
            Array.from({ length: 21 }, (_, index) => {
                const day = `2026-09-${String(index + 1).padStart(2, "0")}`
                return seedPublicEvent(
                    { venue, category },
                    { startsAt: `${day}T21:00`, endsAt: `${day}T23:30` },
                )
            }),
        )
        const [oldest] = past
        const newest = past.at(-1)
        expectToBeDefined(oldest)
        expectToBeDefined(newest)
        const history = page
            .getByRole("dialog", { name: venue.name, exact: true })
            .getByRole("region", { name: t("shared", "Venue.History") })

        await gotoPage(page, venueDetailPath(venue.id))
        await expect(history.getByText(newest.title)).toBeVisible()
        await expect(history.getByText(oldest.title)).toBeHidden()

        await clickButton(history, t("shared", "Venue.More"))

        await expect(history.getByText(oldest.title)).toBeVisible()
        await expect(history.getByText(newest.title)).toBeVisible()
        await expect(
            history.getByRole("button", { name: t("shared", "Venue.More") }),
        ).toBeHidden()
    })

    test("opens the saved events in a panel over the map, a saved event over the list, and the list again once its detail closes", async ({
        page,
    }) => {
        const center = buildArea()
        const event = await seedPublicEvent(
            {
                venue: await seedVenue(
                    offsetPoint(center, { latitude: 0.005, longitude: 0 }),
                ),
                category: await seedCategory(),
            },
            { startsAt: "2026-10-24T18:00", endsAt: "2026-10-24T20:00" },
        )
        const savedPanel = page.getByRole("dialog", {
            name: t("shared", "PageTitle.Saved"),
            exact: true,
        })
        const detail = page.getByRole("dialog", { name: event.title, exact: true })

        await gotoPage(page, eventDetailPath(event.id, "2026-10-24"))
        await detail.getByRole("button", { name: t("shared", "Saved.Toggle") }).click()
        await expectToast(page, { type: "success" }, t("shared", "Saved.Added"))
        await dismissToast(page, { type: "success" }, t("shared", "Saved.Added"))

        await gotoPage(page, mapPath(center))
        await page.getByRole("button", { name: t("shared", "Saved.Open") }).click()

        await expect(savedPanel).toBeVisible()
        await expect(page).toHaveURL(/saved=true/u)
        await savedPanel
            .getByRole("listitem")
            .filter({ hasText: event.title })
            .getByRole("link")
            .click()

        await expect(detail).toBeVisible()
        await expect(savedPanel).toBeHidden()
        await clickIconButton(detail, t("shared", "Detail.Back"))

        await expect(detail).toBeHidden()
        await expect(savedPanel).toBeVisible()
        await clickIconButton(savedPanel, t("shared", "Preview.Close"))

        await expect(savedPanel).toBeHidden()
        await expect(page).not.toHaveURL(/saved=true/u)
    })

    test("names an event or a venue that is no longer visible", async ({ page }) => {
        const venue = await seedVenue(buildArea())
        const event = await seedPublicEvent({ venue, category: await seedCategory() }, {})
        const hidden = await seedVenue(buildArea())
        const admin = await signInAs("admin")
        await blockPublicEvent(event.id)
        expectStatus(
            await blockVenue({
                headers: admin.headers,
                pathParams: { id: hidden.id },
                body: { reason: "Closed for works" },
            }),
            200,
        )

        for (const [path, notice] of [
            [eventDetailPath(event.id, "2026-10-24"), t("shared", "Preview.Unavailable")],
            [venueDetailPath(hidden.id), t("shared", "Venue.Unavailable")],
        ] as const) {
            await gotoPage(page, path)

            await expectAlert(page, { type: "error", text: notice })
        }
    })

    test("opens the event and venue links of earlier pages on the map with the detail open, an English one in Italian", async ({
        page,
    }) => {
        const venue = await seedVenue(buildArea())
        const event = await seedPublicEvent({ venue, category: await seedCategory() }, {})

        for (const [path, url, name] of [
            [
                `/it/events/${event.id}/2026-10-24`,
                `/it?event=${event.id}&occurrence=2026-10-24&detail=true`,
                event.title,
            ],
            [
                `/en/events/${event.id}/2026-10-24/`,
                `/it?event=${event.id}&occurrence=2026-10-24&detail=true`,
                event.title,
            ],
            [`/it/venues/${venue.id}`, `/it?venue=${venue.id}&detail=true`, venue.name],
        ] as const) {
            await gotoPath(page, path)

            await expect(page).toHaveURL(url)
            await expect(
                page
                    .getByRole("dialog", { name, exact: true })
                    .getByRole("heading", { level: 1, name }),
            ).toBeVisible()
        }
    })
})
