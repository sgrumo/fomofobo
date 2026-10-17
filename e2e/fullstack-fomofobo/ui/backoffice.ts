import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"
import type { Account, AccountRole } from "models"

import type { AccountSeed } from "../api/auth/utils"
import { buildAccountSeed, seedAccount } from "../api/auth/utils"

/**
 * @description Seeds an account of the role and signs the browser in through the sign-in endpoint
 * @param page Page whose browser context holds the session cookie
 * @param role Role of the account
 * @remarks The request context of the page shares its cookie jar with the browser
 */
export const signInBrowser = async (
    page: Page,
    role: AccountRole,
): Promise<{ account: Account; seed: AccountSeed }> => {
    const seed = buildAccountSeed(role)
    const account = await seedAccount(seed)
    const response = await page.request.post("/api/auth/sign-in/email", {
        data: { email: seed.email, password: seed.password },
    })
    expect(response.status()).toBe(200)
    return { account, seed }
}
