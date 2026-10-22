import { expect, test } from "@playwright/test"
import { expectStatus, expectToBeDefined } from "e2e-kit/assertions"

import { signInAs } from "../../api/auth/utils"
import { blockVenue, updateVenue } from "../../api/backoffice-venues/api"
import { gotoPage, reloadPage, t } from "../app"
import {
    buildArea,
    preparePublicPage,
    seedCategory,
    seedPublicCinema,
    seedPublicEvent,
    seedVenue,
} from "../public"

test.describe("venue page", () => {
    test.beforeEach(async ({ page }) => {
        await preparePublicPage(page)
    })

    test("shows the profile, the upcoming events with their page, and the past events", async ({
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

        await gotoPage(page, `/venues/${venue.id}/`)

        await expect(
            page.getByRole("heading", { level: 1, name: venue.name }),
        ).toBeVisible()
        await expect(page.getByText(venue.address)).toBeVisible()
        await expect(page.getByText(description)).toBeVisible()
        await expect(
            page.getByRole("link", { name: t("shared", "Venue.Website") }),
        ).toHaveAttribute("href", websiteUrl)
        await expect(
            page.getByRole("link", { name: t("shared", "Detail.Directions") }),
        ).toHaveAttribute(
            "href",
            `https://www.google.com/maps/dir/?api=1&destination=${String(venue.coordinates.latitude)},${String(venue.coordinates.longitude)}`,
        )
        const history = page.getByRole("region", { name: t("shared", "Venue.History") })
        await expect(history.getByText(past.title)).toBeVisible()
        await expect(history.getByText("20/10/2026")).toBeVisible()

        await page
            .getByRole("region", { name: t("shared", "Venue.Upcoming") })
            .getByRole("link", { name: upcoming.title })
            .click()

        await expect(page).toHaveURL(`/it/events/${upcoming.id}/2026-10-24`)
        await expect(
            page.getByRole("heading", { level: 1, name: upcoming.title }),
        ).toBeVisible()
    })

    test("pages the past events through the page number of the URL", async ({ page }) => {
        const venue = await seedVenue(buildArea())
        const category = await seedCategory()
        // 21 past events, one a day from 1 to 21 September: the oldest alone is on page 2.
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
        const history = page.getByRole("region", { name: t("shared", "Venue.History") })

        await gotoPage(page, `/venues/${venue.id}/`)
        await expect(history.getByText(newest.title)).toBeVisible()
        await expect(history.getByText(oldest.title)).toBeHidden()

        await history
            .getByRole("button", { name: t("ui", "Pagination.GoToPage", { page: 2 }) })
            .click()

        await expect(page).toHaveURL(/page=2/u)
        await expect(history.getByText(oldest.title)).toBeVisible()
        await expect(history.getByText(newest.title)).toBeHidden()

        await reloadPage(page)

        await expect(history.getByText(oldest.title)).toBeVisible()
    })

    test("shows the kind of a cinema and links its programme", async ({ page }) => {
        const cinema = await seedPublicCinema(buildArea(), await seedCategory())
        expectToBeDefined(cinema.programmeUrl)

        await gotoPage(page, `/venues/${cinema.id}/`)

        await expect(
            page.getByText(t("shared", "VenueKind.cinema"), { exact: true }),
        ).toBeVisible()
        await expect(
            page.getByRole("link", { name: t("shared", "Preview.Programme") }),
        ).toHaveAttribute("href", cinema.programmeUrl)
    })

    test("answers not found once the venue is blocked", async ({ page }) => {
        const venue = await seedVenue(buildArea())
        const admin = await signInAs("admin")

        await gotoPage(page, `/venues/${venue.id}/`)
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
        await reloadPage(page)

        await expect(page.getByText(t("shared", "NotFound.Title"))).toBeVisible()
    })
})
