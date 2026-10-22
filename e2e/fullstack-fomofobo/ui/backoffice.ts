import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"
import { expectRawStatus } from "e2e-kit/assertions"
import type { Account, AccountRole } from "models"
import { encodeTwoColorPng } from "shared/image"

import type { AccountSeed } from "../api/auth/utils"
import { buildAccountSeed, seedAccount, signIn, toCookieHeader } from "../api/auth/utils"

/**
 * @description Seeds an account of the role, signs the browser in, and opens a second session for API calls of the same account
 * @param page Page whose browser context holds the session cookie
 * @param role Role of the account
 * @remarks The request context of the page shares its cookie jar with the browser
 */
export const signInBrowser = async (
    page: Page,
    role: AccountRole,
): Promise<{ account: Account; seed: AccountSeed; headers: { Cookie: string } }> => {
    const seed = buildAccountSeed(role)
    const account = await seedAccount(seed)
    const response = await page.request.post("/api/auth/sign-in/email", {
        data: { email: seed.email, password: seed.password },
    })
    expect(response.status()).toBe(200)
    const apiSession = await signIn(seed)
    expectRawStatus(apiSession, 200)
    return {
        account,
        seed,
        headers: { Cookie: toCookieHeader(apiSession.headers["set-cookie"]) },
    }
}

/**
 * @description Builds a photo file to pick: a random two-color PNG of 1800 x 1200 pixels
 */
export const buildPhotoFile = async (): Promise<{
    name: string
    mimeType: string
    buffer: Buffer
}> => {
    const grid = { width: 600, height: 400 }
    const indices = Uint8Array.from({ length: grid.width * grid.height }, () =>
        Math.random() < 0.5 ? 0 : 1,
    )
    const png = await encodeTwoColorPng(
        indices,
        grid,
        [
            [0, 0, 0],
            [255, 255, 255],
        ],
        3,
    )
    return { name: "cover.png", mimeType: "image/png", buffer: Buffer.from(png) }
}
