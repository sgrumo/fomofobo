import { expect, test } from "@playwright/test"
import { expectStatus } from "e2e-kit/assertions"
import { expectAlert } from "e2e-ui-components/alert"
import { clickButton } from "e2e-ui-components/button"
import { fillInput } from "e2e-ui-components/input"
import { fillPasswordInput } from "e2e-ui-components/password-input"

import { buildAccountSeed, seedAccount, signInAs } from "../../api/auth/utils"
import { blockOrganizer } from "../../api/backoffice-organizers/api"
import { gotoBackofficePage, t } from "../app"

test.describe("backoffice login", () => {
    test("signs in and lands on the page it was asked for", async ({ page }) => {
        const seed = buildAccountSeed("organizer")
        await seedAccount(seed)

        await gotoBackofficePage(page, "/backoffice/venues")
        await expect(page).toHaveURL(
            /\/backoffice\/login\?return-to=%2Fbackoffice%2Fvenues$/u,
        )

        await fillInput(page, t("shared", "Backoffice.Login.Email"), seed.email)
        await fillPasswordInput(
            page,
            t("shared", "Backoffice.Login.Password"),
            seed.password,
        )
        await clickButton(page, t("shared", "Backoffice.Login.Submit"))

        await expect(page).toHaveURL(/\/backoffice\/venues$/u)
        await expect(
            page.getByRole("navigation", { name: t("shared", "Backoffice.Nav.Label") }),
        ).toBeVisible()
    })

    test("refuses a wrong password and a blocked account with one message", async ({
        page,
    }) => {
        const wrongPassword = buildAccountSeed("organizer")
        await seedAccount(wrongPassword)
        const blocked = buildAccountSeed("organizer")
        const blockedAccount = await seedAccount(blocked)
        const { headers } = await signInAs("admin")
        expectStatus(
            await blockOrganizer({ headers, pathParams: { id: blockedAccount.id } }),
            200,
        )

        for (const credentials of [
            { email: wrongPassword.email, password: `${wrongPassword.password}x` },
            { email: blocked.email, password: blocked.password },
        ]) {
            await gotoBackofficePage(page, "/backoffice/login")
            await fillInput(
                page,
                t("shared", "Backoffice.Login.Email"),
                credentials.email,
            )
            await fillPasswordInput(
                page,
                t("shared", "Backoffice.Login.Password"),
                credentials.password,
            )
            await clickButton(page, t("shared", "Backoffice.Login.Submit"))

            await expectAlert(page, {
                type: "error",
                text: t("shared", "Backoffice.Login.InvalidCredentials"),
            })
            await expect(page).toHaveURL(/\/backoffice\/login$/u)
        }
    })

    test("ignores a return path outside the backoffice", async ({ page }) => {
        const seed = buildAccountSeed("organizer")
        await seedAccount(seed)

        await gotoBackofficePage(
            page,
            `/backoffice/login?return-to=${encodeURIComponent("https://evil.example.com/backoffice")}`,
        )
        await fillInput(page, t("shared", "Backoffice.Login.Email"), seed.email)
        await fillPasswordInput(
            page,
            t("shared", "Backoffice.Login.Password"),
            seed.password,
        )
        await clickButton(page, t("shared", "Backoffice.Login.Submit"))

        await expect(page).toHaveURL(/\/backoffice\/events$/u)
    })

    test("tells an open session that its account is blocked", async ({ page }) => {
        await gotoBackofficePage(page, "/backoffice/login?reason=blocked")

        await expectAlert(page, {
            type: "error",
            text: t("shared", "Backoffice.Login.Blocked"),
        })
    })
})
