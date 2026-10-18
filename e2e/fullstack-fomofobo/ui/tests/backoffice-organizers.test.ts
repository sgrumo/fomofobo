import { faker } from "@faker-js/faker"
import { expect, test } from "@playwright/test"
import { confirmAlertDialog } from "e2e-ui-components/alert-dialog"
import { clickButton } from "e2e-ui-components/button"
import { getDialog } from "e2e-ui-components/dialog"
import { fillInput } from "e2e-ui-components/input"
import { fillPasswordInput } from "e2e-ui-components/password-input"
import { clickTableRowAction, expectTableRow } from "e2e-ui-components/table"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { gotoBackofficePage, t } from "../app"
import { signInBrowser } from "../backoffice"

test.describe("backoffice organizers", () => {
    test("creates an organizer, who signs in with the temporary password", async ({
        page,
    }) => {
        const name = `Organizer ${crypto.randomUUID().slice(0, 8)}`
        const email = faker.internet.email().toLowerCase()
        const password = faker.internet.password({ length: 16 })
        await signInBrowser(page, "admin")

        await gotoBackofficePage(page, "/backoffice/organizers")
        await clickButton(page, t("shared", "Backoffice.Organizers.New"))
        const dialog = getDialog(page, t("shared", "Backoffice.Organizers.Create.Title"))
        await fillInput(dialog, t("shared", "Backoffice.OrganizerForm.Name"), name)
        await fillInput(dialog, t("shared", "Backoffice.OrganizerForm.Email"), email)
        await fillPasswordInput(
            dialog,
            t("shared", "Backoffice.OrganizerForm.Password"),
            password,
        )
        await clickButton(dialog, t("shared", "Backoffice.Organizers.Create.Submit"))

        const message = t("shared", "Backoffice.Organizers.Toast.Created", { name })
        await expectToast(page, { type: "success" }, message)
        await dismissToast(page, { type: "success" }, message)
        await expectTableRow(page, [
            ["exact", name],
            ["exact", email],
            ["exact", t("shared", "Backoffice.Filters.active")],
        ])

        await page.context().clearCookies()
        await gotoBackofficePage(page, "/backoffice/login")
        await fillInput(page, t("shared", "Backoffice.Login.Email"), email)
        await fillPasswordInput(page, t("shared", "Backoffice.Login.Password"), password)
        await clickButton(page, t("shared", "Backoffice.Login.Submit"))
        await expect(page).toHaveURL(/\/backoffice\/events$/u)
    })

    test("ends the open session of an organizer it blocks", async ({
        page,
        browser,
        baseURL,
    }) => {
        const organizerContext = await browser.newContext({ baseURL })
        const organizerPage = await organizerContext.newPage()
        const { account } = await signInBrowser(organizerPage, "organizer")
        await gotoBackofficePage(organizerPage, "/backoffice/events")
        await signInBrowser(page, "admin")

        await gotoBackofficePage(page, "/backoffice/organizers")
        await fillInput(page, t("shared", "Backoffice.Organizers.Search"), account.email)
        await clickTableRowAction(
            page,
            ["exact", account.name],
            t("shared", "Backoffice.Actions.Block"),
        )
        await confirmAlertDialog(page, {
            confirmLabel: t("shared", "Backoffice.Actions.Block"),
        })

        const message = t("shared", "Backoffice.Organizers.Toast.Blocked", {
            name: account.name,
        })
        await expectToast(page, { type: "success" }, message)
        await dismissToast(page, { type: "success" }, message)
        await expectTableRow(page, [
            ["exact", account.name],
            ["exact", t("shared", "Backoffice.Filters.blocked")],
        ])

        await fillInput(
            organizerPage,
            t("shared", "Backoffice.Events.Search"),
            crypto.randomUUID(),
        )
        await expect(organizerPage).toHaveURL(/\/backoffice\/login\?return-to=/u)
        await organizerContext.close()
    })
})
