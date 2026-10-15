import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import { clickButton } from "e2e-ui-components/button"
import {
    checkCheckbox,
    expectCheckboxChecked,
    expectCheckboxUnchecked,
} from "e2e-ui-components/checkbox"
import { expectDialogClosed, openDialog } from "e2e-ui-components/dialog"
import {
    clearInputByPlaceholder,
    expectInputValueByPlaceholder,
    fillInput,
    fillInputByPlaceholder,
} from "e2e-ui-components/input"
import { expectSpinnerHidden } from "e2e-ui-components/spinner"
import { expectNoTableRow, expectTableRow } from "e2e-ui-components/table"

import { gotoPage, reloadPage, signIn, t } from "../app"

/**
 * @description Creates a todo through the create dialog of the todos page
 * @param page Page under test
 * @param title Todo title
 * @remarks Leaves the browser on the todos page
 */
const createTodo = async (page: Page, title: string) => {
    await gotoPage(page, "/todos/")
    const dialog = await openDialog(
        page,
        t("shared", "Todos.Create.Trigger"),
        t("shared", "Todos.Create.Title"),
    )
    await fillInput(dialog, t("shared", "Todos.Fields.Title"), title)
    await clickButton(dialog, t("shared", "Todos.Create.Submit"))
    await expectDialogClosed(page, t("shared", "Todos.Create.Title"))
    await expect(page.getByRole("list").getByText(title)).toBeVisible()
}

/**
 * @description Marks the todo completed through the update dialog of the todos page
 * @param page Page under test, on the todos page
 * @param title Todo title
 * @remarks Uses the update dialog, since the create dialog holds no completed field
 */
const completeTodo = async (page: Page, title: string) => {
    const item = page.getByRole("list").getByRole("listitem").filter({ hasText: title })
    const dialog = await openDialog(
        item,
        t("shared", "Todos.Edit"),
        t("shared", "Todos.Update.Title"),
    )
    await checkCheckbox(dialog, t("shared", "Todos.Fields.Completed"))
    await clickButton(dialog, t("shared", "Todos.Update.Submit"))
    await expectDialogClosed(page, t("shared", "Todos.Update.Title"))
    await expect(item.getByText(t("shared", "Todos.StatusCompleted"))).toBeVisible()
}

/**
 * @description Types the text into the search input and waits for the results
 * @param page Page under test
 * @param text Search text
 */
const search = async (page: Page, text: string) => {
    await fillInputByPlaceholder(page, t("shared", "TodosSearch.TextPlaceholder"), text)
    await expect(page).toHaveURL(new RegExp(`[?&]text=${text}(?:&|$)`, "u"))
    await expectSpinnerHidden(page, t("shared", "TodosSearch.Loading"))
}

test.describe("Todos search page", () => {
    test.beforeEach(async ({ page }) => {
        await signIn(page)
    })

    test("displays the page heading", async ({ page }) => {
        await gotoPage(page, "/todos/search/")

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: t("shared", "TodosSearch.Title"),
            }),
        ).toBeVisible()
    })

    // No space in the title: the search string encodes a space as `+`, which the URL
    // assertion below must not guess.
    test("keeps the text in the URL", async ({ page }) => {
        const title = `search-${crypto.randomUUID()}`
        const otherTitle = `other-${crypto.randomUUID()}`
        await createTodo(page, title)
        await createTodo(page, otherTitle)

        await gotoPage(page, "/todos/search/")
        await search(page, title)
        await expectTableRow(page, ["exact", title])
        await expectNoTableRow(page, ["exact", otherTitle])

        await reloadPage(page)
        await expectInputValueByPlaceholder(
            page,
            t("shared", "TodosSearch.TextPlaceholder"),
            title,
        )
        await expectTableRow(page, ["exact", title])
        await expectNoTableRow(page, ["exact", otherTitle])
    })

    test("drops the text from the URL when the input is cleared", async ({ page }) => {
        const title = `clear-${crypto.randomUUID()}`
        await createTodo(page, title)

        await gotoPage(page, "/todos/search/")
        await search(page, title)
        await clearInputByPlaceholder(page, t("shared", "TodosSearch.TextPlaceholder"))
        await expect(page).not.toHaveURL(/[?&]text=/u)
        await expectSpinnerHidden(page, t("shared", "TodosSearch.Loading"))
        await expectTableRow(page, ["exact", title])
    })

    test("keeps the completed filter in the URL", async ({ page }) => {
        await gotoPage(page, "/todos/search/")
        await checkCheckbox(page, t("shared", "TodosSearch.CompletedOnly"))
        await expect(page).toHaveURL(/[?&]completed=true(?:&|$)/u)

        await reloadPage(page)
        await expectCheckboxChecked(page, t("shared", "TodosSearch.CompletedOnly"))
    })

    test("reads the filters from a shared link", async ({ page }) => {
        const title = `shared-${crypto.randomUUID()}`
        await createTodo(page, title)

        await gotoPage(page, `/todos/search/?text=${title}`)
        await expectInputValueByPlaceholder(
            page,
            t("shared", "TodosSearch.TextPlaceholder"),
            title,
        )
        await expectTableRow(page, ["exact", title])
    })

    // The checkbox filters on completed todos only, so `completed=false` means no filter
    // and keeps a completed todo in the results.
    test("ignores `completed=false` in a shared link", async ({ page }) => {
        const title = `done-${crypto.randomUUID()}`
        await createTodo(page, title)
        await completeTodo(page, title)

        await gotoPage(page, `/todos/search/?text=${title}&completed=false`)
        await expectCheckboxUnchecked(page, t("shared", "TodosSearch.CompletedOnly"))
        await expectSpinnerHidden(page, t("shared", "TodosSearch.Loading"))
        await expectTableRow(page, ["exact", title])
    })
})
