import type { Page } from "@playwright/test"
import { createI18n, e2eLocale } from "e2e-kit/i18n"

import { LOCALES_DIR } from "../server"

// The language a route handler lands on when the URL names none.
const DEFAULT_LANGUAGE = "en"

export const { t } = createI18n(LOCALES_DIR)

/**
 * @description Waits until React has hydrated the page
 * @param page Page under test
 * @remarks The root layout sets `data-hydrated` on `<html>`. An event fired before it
 * reaches no handler and is lost
 */
const waitForHydration = async (page: Page): Promise<void> => {
    await page.locator("html[data-hydrated]").waitFor({ state: "attached" })
}

/**
 * @description Opens a page of the app in the E2E locale and waits until it hydrates
 * @param page Page under test
 * @param pagePath Path of the page with no language, `/todos/` for instance
 * @remarks The language is the first URL segment, so the path carries the E2E locale
 */
export const gotoPage = async (page: Page, pagePath: string): Promise<void> => {
    await page.goto(`/${e2eLocale}${pagePath}`)
    await waitForHydration(page)
}

/**
 * @description Reloads the current page and waits until it hydrates
 * @param page Page under test
 */
export const reloadPage = async (page: Page): Promise<void> => {
    await page.reload()
    await waitForHydration(page)
}

/**
 * @description Returns the pattern of the root URL a route handler lands on
 * @remarks The root of the default language, not of the E2E locale
 */
export const handlerRootUrl = (): RegExp => new RegExp(`/${DEFAULT_LANGUAGE}/?$`, "u")

/**
 * @description Signs the visitor in through the provider
 * @param page Page under test
 * @remarks Drives the real round trip: `/auth/login` redirects to the provider, the
 * provider answers a code with no form of its own, and the callback writes the session
 * cookies. The mock provider runs with `interactiveLogin: false`, so no page of it ever
 * shows
 * @remarks Lands on the root of the default language, because this drives
 * `/auth/login` with no `returnTo`
 */
export const signIn = async (page: Page): Promise<void> => {
    await page.goto("/auth/login")
    await page.waitForURL(handlerRootUrl())
}
