import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

import { gotoPage, handlerRootUrl, signIn, t } from "../app"

/**
 * @description Returns the avatar that opens the session menu, which shows only with a session
 * @param page Page under test
 */
const sessionMenuTrigger = (page: Page) =>
    page.getByRole("button", { name: t("shared", "Session.Menu") })

/**
 * @description Returns the sign-out item of the open session menu
 * @param page Page under test
 */
const signOutItem = (page: Page) =>
    page.getByRole("menuitem", { name: t("shared", "Session.SignOut") })

test.describe("Authentication", () => {
    test("sends a signed-out visitor through the provider and back to the page", async ({
        page,
    }) => {
        await gotoPage(page, "/todos/search/?text=milk")

        // The guard redirects with the page as `returnTo`, the provider answers at
        // once, and the callback lands the visitor on the page they asked for,
        // query included, signed in.
        await page.waitForURL(/\/todos\/search\/?\?text=milk$/u)
        await expect(sessionMenuTrigger(page)).toBeVisible()
    })

    test("keeps a public page open with no session", async ({ page }) => {
        await gotoPage(page, "/dev/samples/")

        await expect(
            page.getByRole("region", { name: "Accordion Samples", exact: true }),
        ).toBeVisible()
        await expect(sessionMenuTrigger(page)).toBeHidden()
    })

    test("shows the visitor of the provider after the login", async ({ page }) => {
        await signIn(page)
        await gotoPage(page, "/todos/")
        await sessionMenuTrigger(page).click()

        await expect(
            page.getByText(t("shared", "Session.SignedInAs", { name: "E2E User" })),
        ).toBeVisible()
    })

    test("reads the API of a guarded page with the session", async ({ page }) => {
        await signIn(page)
        await gotoPage(page, "/todos/")

        // The empty state of the paginated table renders, and no error state does:
        // the prefetch and the browser query both carried a token the API accepted.
        // The page shows the same empty text twice, so the assertion names the cell.
        await expect(
            page.getByRole("cell").getByText(t("shared", "Todos.Empty")),
        ).toBeVisible()
        await expect(page.getByText(t("shared", "Todos.Error"))).toBeHidden()
    })

    test("ends the session on sign out", async ({ page }) => {
        await signIn(page)
        await gotoPage(page, "/todos/")
        await sessionMenuTrigger(page).click()
        await expect(signOutItem(page)).toBeVisible()

        await signOutItem(page).click()
        await page.waitForURL(handlerRootUrl())

        // Reads the jar, not the page: the root is public and renders no session menu
        // either way, so only the cookies prove the sign-out landed.
        const cookies = await page.context().cookies()
        expect(cookies.filter(cookie => cookie.name.includes("fomofobo-"))).toStrictEqual(
            [],
        )
        await expect(sessionMenuTrigger(page)).toBeHidden()
    })
})
