import type { Page } from "@playwright/test"
import { createI18n, e2eLocale } from "e2e-kit/i18n"

import { LOCALES_DIR } from "../server"

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
 * @description Opens a backoffice page and waits until it hydrates
 * @param page Page under test
 * @param pagePath Path of the page, `/backoffice/events` for instance
 * @remarks The backoffice lives outside the language segment
 */
export const gotoBackofficePage = async (page: Page, pagePath: string): Promise<void> => {
    await page.goto(pagePath)
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
