import type { Locator, Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import { clickButton } from "e2e-ui-components/button"
import { checkCheckbox } from "e2e-ui-components/checkbox"
import { expectDialogClosed, openDialog } from "e2e-ui-components/dialog"
import { fillInput } from "e2e-ui-components/input"
import { expectCurrentPage, goToPage } from "e2e-ui-components/pagination"

import { gotoPage, reloadPage, signIn, t } from "../app"

const todoList = (page: Page) => page.getByRole("list")

const todoItem = (page: Page, title: string): Locator =>
    todoList(page).getByRole("listitem").filter({ hasText: title })

/**
 * @description Creates a todo through the create dialog and asserts it in the list
 * @param page Page under test
 * @param title Todo title
 */
const addTodo = async (page: Page, title: string) => {
    const dialog = await openDialog(
        page,
        t("shared", "Todos.Create.Trigger"),
        t("shared", "Todos.Create.Title"),
    )
    await fillInput(dialog, t("shared", "Todos.Fields.Title"), title)
    await clickButton(dialog, t("shared", "Todos.Create.Submit"))
    await expectDialogClosed(page, t("shared", "Todos.Create.Title"))
    await expect(todoList(page).getByText(title)).toBeVisible()
}

/**
 * @description Opens the update dialog of the todo carrying the title
 * @param page Page under test
 * @param title Todo title
 */
const openUpdateDialog = async (page: Page, title: string): Promise<Locator> =>
    await openDialog(
        todoItem(page, title),
        t("shared", "Todos.Edit"),
        t("shared", "Todos.Update.Title"),
    )

test.describe("Todos page", () => {
    test.beforeEach(async ({ page }) => {
        await signIn(page)
        await gotoPage(page, "/todos/")

        await expect(
            page.getByRole("heading", { level: 1, name: t("shared", "Todos.Title") }),
        ).toBeVisible()
    })

    test("displays the page heading", async ({ page }) => {
        await expect(
            page.getByRole("heading", { level: 1, name: t("shared", "Todos.Title") }),
        ).toBeVisible()
    })

    // Titles are scoped to the editable list; the page also renders them in the
    // read-only paginated table, so an unscoped getByText matches twice.
    test("creates a todo", async ({ page }) => {
        const title = `Buy groceries ${crypto.randomUUID()}`

        await addTodo(page, title)
    })

    test("creates a todo with a description", async ({ page }) => {
        const title = `Plan the trip ${crypto.randomUUID()}`

        const dialog = await openDialog(
            page,
            t("shared", "Todos.Create.Trigger"),
            t("shared", "Todos.Create.Title"),
        )
        await fillInput(dialog, t("shared", "Todos.Fields.Title"), title)
        await fillInput(
            dialog,
            t("shared", "Todos.Fields.Description"),
            "Book the train tickets",
        )
        await clickButton(dialog, t("shared", "Todos.Create.Submit"))
        await expectDialogClosed(page, t("shared", "Todos.Create.Title"))

        await expect(todoList(page).getByText(title)).toBeVisible()
    })

    test("rejects an empty title", async ({ page }) => {
        const dialog = await openDialog(
            page,
            t("shared", "Todos.Create.Trigger"),
            t("shared", "Todos.Create.Title"),
        )
        await clickButton(dialog, t("shared", "Todos.Create.Submit"))

        await expect(dialog).toBeVisible()
    })

    test("marks a todo as completed", async ({ page }) => {
        const title = `Walk the dog ${crypto.randomUUID()}`

        await addTodo(page, title)
        await expect(
            todoItem(page, title).getByText(t("shared", "Todos.StatusPending")),
        ).toBeVisible()

        const dialog = await openUpdateDialog(page, title)
        await checkCheckbox(dialog, t("shared", "Todos.Fields.Completed"))
        await clickButton(dialog, t("shared", "Todos.Update.Submit"))
        await expectDialogClosed(page, t("shared", "Todos.Update.Title"))

        await expect(
            todoItem(page, title).getByText(t("shared", "Todos.StatusCompleted")),
        ).toBeVisible()
    })

    test("edits a todo title", async ({ page }) => {
        const originalTitle = `Read a book ${crypto.randomUUID()}`
        const newTitle = `Read two books ${crypto.randomUUID()}`
        const list = todoList(page)

        await addTodo(page, originalTitle)

        const dialog = await openUpdateDialog(page, originalTitle)
        await fillInput(dialog, t("shared", "Todos.Fields.Title"), newTitle)
        await clickButton(dialog, t("shared", "Todos.Update.Submit"))
        await expectDialogClosed(page, t("shared", "Todos.Update.Title"))

        await expect(list.getByText(newTitle)).toBeVisible()
        await expect(list.getByText(originalTitle)).toBeHidden()
    })

    test("cancels editing a todo", async ({ page }) => {
        const title = `Clean the house ${crypto.randomUUID()}`
        const list = todoList(page)

        await addTodo(page, title)

        const dialog = await openUpdateDialog(page, title)
        await fillInput(
            dialog,
            t("shared", "Todos.Fields.Title"),
            "Something else entirely",
        )
        await clickButton(dialog, t("shared", "Todos.Cancel"))
        await expectDialogClosed(page, t("shared", "Todos.Update.Title"))

        await expect(list.getByText(title)).toBeVisible()
        await expect(list.getByText("Something else entirely")).toBeHidden()
    })
})

test.describe("Todos pagination", () => {
    test.beforeEach(async ({ page }) => {
        await signIn(page)
    })

    // The table holds five todos per page, so six todos give it a second page
    // whatever the other tests created.
    test("keeps the page in the URL", async ({ page }) => {
        await gotoPage(page, "/todos/")
        for (const chore of ["Water", "Feed", "Wash", "Sweep", "Cook", "Iron"]) {
            await addTodo(page, `${chore} ${crypto.randomUUID()}`)
        }
        await expectCurrentPage(page, 1)

        await goToPage(page, 2)
        await expectCurrentPage(page, 2)
        await expect(page).toHaveURL(/[?&]page=2(?:&|$)/u)

        await reloadPage(page)
        await expectCurrentPage(page, 2)

        await page.goBack()
        await expectCurrentPage(page, 1)
        await expect(page).not.toHaveURL(/[?&]page=/u)
    })
})
