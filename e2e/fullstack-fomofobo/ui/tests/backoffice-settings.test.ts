import { expect, test } from "@playwright/test"
import { clickButton } from "e2e-ui-components/button"
import { expectNumberInputValue, fillNumberInput } from "e2e-ui-components/number-input"
import { dismissToast, expectToast } from "e2e-ui-components/toast"

import { gotoBackofficePage, reloadPage, t } from "../app"
import { signInBrowser } from "../backoffice"

test.describe("backoffice settings", () => {
    test("shows the defaults, saves new values and names the Admin who saved them", async ({
        page,
    }) => {
        const { account } = await signInBrowser(page, "admin")
        const daysLabel = t("shared", "Backoffice.SettingsForm.EndedVisibleDays")
        const thresholdLabel = t("shared", "Backoffice.SettingsForm.ParticipantThreshold")

        await gotoBackofficePage(page, "/backoffice/settings")
        await expect(
            page.getByText(t("shared", "Backoffice.Settings.Defaults")),
        ).toBeVisible()
        await expectNumberInputValue(page, daysLabel, "3")
        await expectNumberInputValue(page, thresholdLabel, "20")
        await fillNumberInput(page, daysLabel, 5)
        await fillNumberInput(page, thresholdLabel, 40)
        await clickButton(page, t("shared", "Backoffice.Settings.Save"))

        const saved = t("shared", "Backoffice.Settings.Toast.Saved")
        await expectToast(page, { type: "success" }, saved)
        await dismissToast(page, { type: "success" }, saved)
        await reloadPage(page)
        await expectNumberInputValue(page, daysLabel, "5")
        await expectNumberInputValue(page, thresholdLabel, "40")
        // The date of the save is the clock of the server: match the text before it
        const [lastChangeByAdmin = ""] = t("shared", "Backoffice.Settings.LastChange", {
            name: account.name,
            date: "|",
        }).split("|")
        await expect(page.getByText(lastChangeByAdmin, { exact: false })).toBeVisible()
    })
})
