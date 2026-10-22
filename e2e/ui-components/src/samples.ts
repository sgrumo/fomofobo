import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

import {
    closeAccordionItem,
    expectAccordionItemClosed,
    expectAccordionItemContent,
    expectAccordionItemOpen,
    expectAccordionItemTitle,
    openAccordionItem,
} from "./accordion"
import { expectAlert } from "./alert"
import {
    cancelAlertDialog,
    closeAlertDialog,
    confirmAlertDialog,
    expectAlertDialog,
    openAlertDialog,
} from "./alert-dialog"
import {
    enterAutocompleteInput,
    expectAutocompleteEmpty,
    expectAutocompleteValue,
    selectAutocompleteItem,
} from "./autocomplete"
import { expectAvatarFallback, expectAvatarImage } from "./avatar"
import { expectBadge } from "./badge"
import {
    dismissBottomSheet,
    expectBottomSheetClosed,
    expectBottomSheetOpen,
    openBottomSheet,
} from "./bottom-sheet"
import { clickButton, expectButtonDisabled, expectButtonEnabled } from "./button"
import {
    checkCheckbox,
    expectCheckboxChecked,
    expectCheckboxIndeterminate,
    expectCheckboxUnchecked,
    uncheckCheckbox,
} from "./checkbox"
import {
    expectChipNotPressed,
    expectChipPressed,
    getChipRow,
    pressChip,
    unpressChip,
} from "./chip"
import {
    closeCollapsible,
    expectCollapsibleClosed,
    expectCollapsibleContent,
    expectCollapsibleOpen,
    openCollapsible,
} from "./collapsible"
import {
    expectComboboxChips,
    expectComboboxEmpty,
    expectComboboxValue,
    removeComboboxChip,
    resetCombobox,
    searchComboboxItem,
    selectComboboxItem,
    selectComboboxItems,
} from "./combobox"
import {
    clickContextMenuItem,
    expectContextMenuItem,
    openContextMenu,
} from "./context-menu"
import {
    expectDateInputEmpty,
    expectDateInputValue,
    fillNativeDateInput,
    pickDate,
    resetDateInput,
} from "./date-input"
import {
    expectDayPickerView,
    goToDayPickerNextMonth,
    pickDayPickerDay,
} from "./day-picker"
import { closeDialog, expectDialogClosed, expectDialogOpen, openDialog } from "./dialog"
import { closeDrawer, expectDrawerClosed, expectDrawerOpen, openDrawer } from "./drawer"
import { expectEmptyFallback, expectErrorFallback } from "./fallback-box"
import {
    expectFieldDescription,
    expectFieldViewSelection,
    expectFieldViewValue,
    hoverFieldInfo,
} from "./field"
import { t } from "./i18n"
import { clickIconButton } from "./icon-button"
import {
    clearInput,
    clearInputByPlaceholder,
    expectInputDisabled,
    expectInputValue,
    expectInputValueByPlaceholder,
    fillInput,
    fillInputByPlaceholder,
} from "./input"
import { clickMenuItem, expectMenuClosed, expectMenuItems, openMenu } from "./menu"
import { expectMeterValue } from "./meter"
import {
    decrementNumberInput,
    expectNumberInputValue,
    fillNumberInput,
    incrementNumberInput,
} from "./number-input"
import {
    clearOtpInput,
    expectOtpInputDisabled,
    expectOtpInputEmpty,
    expectOtpInputMasked,
    expectOtpInputValue,
    fillOtpInput,
} from "./otp-input"
import { expectCurrentPage, goToNextPage, goToPage, goToPreviousPage } from "./pagination"
import {
    expectPasswordHidden,
    expectPasswordVisible,
    fillPasswordInput,
    togglePasswordVisibility,
} from "./password-input"
import {
    closePopover,
    expectPopoverClosed,
    expectPopoverContent,
    openPopover,
} from "./popover"
import { expectProgressComplete, expectProgressValue } from "./progress"
import { expectRadioNotSelected, expectRadioSelected, selectRadioItem } from "./radio"
import { expectSearchFieldValue, fillSearchField, resetSearchField } from "./search-field"
import {
    expectSelectOptions,
    expectSelectPlaceholder,
    expectSelectValue,
    resetSelect,
    selectSelectItem,
    selectSelectItems,
} from "./select"
import { expectSeparator } from "./separator"
import type { TextMatch } from "./shared"
import { monthKeyOf } from "./shared"
import { expectSliderValue, setSliderValue } from "./slider"
import { expectSpinner } from "./spinner"
import { expectStatGridValue } from "./stat-grid"
import {
    expectCurrentStep,
    expectStepDisabled,
    expectStepStatus,
    goToStep,
} from "./stepper"
import { expectSwitchOff, expectSwitchOn, switchOff, switchOn } from "./switch"
import {
    clickTableRowAction,
    expectNoTableRow,
    expectTableEmpty,
    expectTableHeaders,
    expectTableRow,
    expectTableRowCount,
    getTable,
} from "./table"
import { expectSelectedTab, expectTabPanelContent, selectTab } from "./tabs"
import { expectTickProgress } from "./tick-progress"
import { expectTimeline } from "./timeline"
import { dismissToast, expectToast } from "./toast"
import {
    expectTogglePressed,
    expectToggleNotPressed,
    pressToggle,
    unpressToggle,
} from "./toggle"
import {
    expectTooltip,
    expectTooltipHidden,
    hoverTooltipTrigger,
    unhoverTooltip,
} from "./tooltip"

export interface UiSamplesApp {
    /** Opens the samples page in the E2E locale, ready for input. */
    openSamples: (page: Page) => Promise<void>
}

const section = (page: Page, name: string) =>
    page.getByRole("region", { name, exact: true })

/**
 * @description Registers the tests of every UI helper against the samples page of an app
 * @param app Opener of the samples page
 */
export const defineUiSamplesTests = (app: UiSamplesApp) => {
    test.describe("UI component helpers", () => {
        test.beforeEach(async ({ page }) => {
            await app.openSamples(page)
        })

        test("accordion", async ({ page }) => {
            const scope = section(page, "Accordion Samples")
            await expectAccordionItemTitle(scope, ["exact", "Accordion First Item"])
            await expectAccordionItemTitle(scope, ["exact", "Accordion Second Item"])
            await expectAccordionItemClosed(scope, ["exact", "Accordion First Item"])

            await openAccordionItem(scope, ["exact", "Accordion First Item"])
            await expectAccordionItemOpen(scope, ["exact", "Accordion First Item"])
            await expectAccordionItemContent(
                scope,
                ["exact", "Accordion First Item"],
                "First item accordion content",
            )

            await openAccordionItem(scope, ["exact", "Accordion Second Item"])
            await expectAccordionItemContent(
                scope,
                ["exact", "Accordion Second Item"],
                "Second item accordion content",
            )
            // multiple={false}: the first item closes on its own
            await expectAccordionItemClosed(scope, ["exact", "Accordion First Item"])

            await closeAccordionItem(scope, ["exact", "Accordion Second Item"])
            await expectAccordionItemClosed(scope, ["exact", "Accordion Second Item"])

            // The action of the third item joins the accessible name of its trigger,
            // so only a partial matcher finds that trigger
            const thirdItem: TextMatch = ["contains", "Accordion Third Item"]
            await expectAccordionItemTitle(scope, thirdItem)
            await openAccordionItem(scope, thirdItem)
            await expectAccordionItemContent(
                scope,
                thirdItem,
                "Third item accordion content",
            )
            await clickButton(scope, "Third item action")
            await expect(scope.getByText("Accordion action: third")).toBeVisible()
            await closeAccordionItem(scope, thirdItem)
            await expectAccordionItemClosed(scope, thirdItem)
        })

        test("alert", async ({ page }) => {
            const scope = section(page, "Alert Samples")
            await expectAlert(scope, { type: "error", text: "Alert error message" })
            await expectAlert(scope, { type: "warning", text: "Alert warning message" })
            await expectAlert(scope, { type: "info", text: "Alert info message" })
            await expectAlert(scope, { type: "success", text: "Alert success message" })
            await expectAlert(scope, { type: "loading", text: "Alert loading message" })
        })

        test("alert dialog", async ({ page }) => {
            const scope = section(page, "Alert Dialog Samples")

            await openAlertDialog(scope, "Open plain alert dialog", "Plain alert dialog")
            await expectAlertDialog(page, {
                title: "Plain alert dialog",
                description: "Plain alert dialog description",
            })
            await closeAlertDialog(page)

            await openAlertDialog(scope, "Open confirm dialog", "Confirm action?")
            await cancelAlertDialog(page)
            await expect(scope.getByText("Confirm outcome: none")).toBeVisible()
            await openAlertDialog(scope, "Open confirm dialog", "Confirm action?")
            await confirmAlertDialog(page)
            await expect(scope.getByText("Confirm outcome: confirmed")).toBeVisible()

            const deleteDialog = await openAlertDialog(
                scope,
                "Open delete dialog",
                "Delete item?",
            )
            await expectButtonDisabled(deleteDialog, t("ui", "Shared.Confirm"))
            await confirmAlertDialog(page, { enterToConfirm: "DELETE" })
            await expect(scope.getByText("Delete outcome: deleted")).toBeVisible()
        })

        test("autocomplete", async ({ page }) => {
            const scope = section(page, "Autocomplete Samples")
            await enterAutocompleteInput(scope, "Autocomplete Fruit", "Ban")
            await selectAutocompleteItem(scope, "Autocomplete Fruit", ["exact", "Banana"])
            await expectAutocompleteValue(scope, "Autocomplete Fruit", "Banana")

            await enterAutocompleteInput(scope, "Autocomplete Fruit", "zzz")
            await expectAutocompleteEmpty(page)
        })

        test("avatar", async ({ page }) => {
            const scope = section(page, "Avatar Samples")
            await expectAvatarImage(scope, "Grace Hopper")
            await expectAvatarFallback(scope, "AL")
        })

        test("badge", async ({ page }) => {
            const scope = section(page, "Badge Samples")
            await expectBadge(scope, ["exact", "Sample live badge"])
            await expectBadge(scope, ["exact", "Sample upcoming badge"])
        })

        test("bottom sheet", async ({ page }) => {
            const scope = section(page, "Bottom Sheet Samples")
            await expectBottomSheetClosed(page, "Sample bottom sheet")

            const sheet = await openBottomSheet(
                scope,
                "Open sample bottom sheet",
                "Sample bottom sheet",
            )
            await expect(sheet.getByText("Sample bottom sheet content")).toBeVisible()
            await clickButton(sheet, "Close sample bottom sheet")
            await expectBottomSheetClosed(page, "Sample bottom sheet")

            await openBottomSheet(
                scope,
                "Open sample bottom sheet",
                "Sample bottom sheet",
            )
            await expectBottomSheetOpen(page, "Sample bottom sheet")
            await dismissBottomSheet(page, "Sample bottom sheet")
        })

        test("button", async ({ page }) => {
            const scope = section(page, "Button Samples")
            await expectButtonEnabled(scope, "Sample Button")
            await clickButton(scope, "Sample Button")
            await expect(scope.getByText("Button clicks: 1")).toBeVisible()
            await clickButton(scope, "Icon Sample Button")
            await expect(scope.getByText("Button clicks: 2")).toBeVisible()
            await expectButtonDisabled(scope, "Disabled Button")
        })

        test("checkbox", async ({ page }) => {
            const scope = section(page, "Checkbox Samples")
            await expectCheckboxUnchecked(scope, "Sample Checkbox")
            await checkCheckbox(scope, "Sample Checkbox")
            await expectCheckboxChecked(scope, "Sample Checkbox")
            await uncheckCheckbox(scope, "Sample Checkbox")
            await expectCheckboxUnchecked(scope, "Sample Checkbox")

            await expectCheckboxIndeterminate(scope, "Indeterminate Checkbox")
            await checkCheckbox(scope, "Indeterminate Checkbox")
            await expectCheckboxChecked(scope, "Indeterminate Checkbox")

            await checkCheckbox(scope, "Banana")
            await expectCheckboxChecked(scope, "Banana")
            await uncheckCheckbox(scope, "Banana")
            await expectCheckboxUnchecked(scope, "Banana")
        })

        test("chip", async ({ page }) => {
            const row = getChipRow(section(page, "Chip Samples"), "Sample chip row")
            await expectChipNotPressed(row, "Sample Music Chip 12")
            await pressChip(row, "Sample Music Chip 12")
            await expectChipPressed(row, "Sample Music Chip 12")
            await expectChipNotPressed(row, "Sample Comedy Chip")
            await unpressChip(row, "Sample Music Chip 12")
            await expectChipNotPressed(row, "Sample Music Chip 12")
        })

        test("collapsible", async ({ page }) => {
            const scope = section(page, "Collapsible Samples")
            await expectCollapsibleClosed(scope, "Collapsible Trigger")
            await openCollapsible(scope, "Collapsible Trigger")
            await expectCollapsibleOpen(scope, "Collapsible Trigger")
            await expectCollapsibleContent(scope, "Collapsible sample content")
            await closeCollapsible(scope, "Collapsible Trigger")
            await expectCollapsibleClosed(scope, "Collapsible Trigger")
        })

        test("combobox", async ({ page }) => {
            const scope = section(page, "Combobox Samples")

            await selectComboboxItem(scope, "Combobox Single Fruit", ["exact", "Apple"])
            await expectComboboxValue(scope, "Combobox Single Fruit", "Apple")
            // Idempotent: an already-selected item causes no reopen
            await selectComboboxItem(scope, "Combobox Single Fruit", ["exact", "Apple"])
            await selectComboboxItem(scope, "Combobox Single Fruit", [
                "contains",
                "Banan",
            ])
            await expectComboboxValue(scope, "Combobox Single Fruit", "Banana")
            await searchComboboxItem(scope, "Combobox Single Fruit", "Cher", [
                "exact",
                "Cherry",
            ])
            await expectComboboxValue(scope, "Combobox Single Fruit", "Cherry")
            await resetCombobox(scope, "Combobox Single Fruit")
            await expectComboboxValue(
                scope,
                "Combobox Single Fruit",
                t("ui", "Combobox.Placeholder"),
            )

            await expectComboboxEmpty(scope, "Combobox Single Fruit", "zzz")
            // The assertion above left no state: the popup is closed and the search
            // that matched nothing no longer filters the list
            await selectComboboxItem(scope, "Combobox Single Fruit", ["exact", "Apple"])
            await expectComboboxValue(scope, "Combobox Single Fruit", "Apple")
            await resetCombobox(scope, "Combobox Single Fruit")

            await selectComboboxItems(scope, "Combobox Multiple Fruits", [
                ["exact", "Apple"],
                ["exact", "Banana"],
            ])
            await expectComboboxChips(scope, "Combobox Multiple Fruits", [
                "Apple",
                "Banana",
            ])
            await removeComboboxChip(scope, "Combobox Multiple Fruits", "Apple")
            await expectComboboxChips(scope, "Combobox Multiple Fruits", ["Banana"])

            await searchComboboxItem(scope, "Combobox Async Fruit", "Dur", [
                "exact",
                "Durian",
            ])
            await expectComboboxValue(scope, "Combobox Async Fruit", "Durian")
        })

        test("context menu", async ({ page }) => {
            const scope = section(page, "Context Menu Samples")
            const target = scope.getByText("Context Menu Target", { exact: true })

            await openContextMenu(target)
            await expectContextMenuItem(page, "Context Action One")
            await expectContextMenuItem(page, "Context Action Two")
            await page.keyboard.press("Escape")
            await expectMenuClosed(page)

            await clickContextMenuItem(target, "Context Action One")
            await expect(scope.getByText("Context selected: one")).toBeVisible()
        })

        test("date input", async ({ page }) => {
            const scope = section(page, "Date Input Samples")
            await expectDateInputEmpty(scope, "Custom Date")
            await pickDate(scope, "Custom Date", { year: 2026, month: 3, day: 12 })
            await expectDateInputValue(scope, "Custom Date", "2026")
            await resetDateInput(scope, "Custom Date")
            await expectDateInputEmpty(scope, "Custom Date")

            await fillNativeDateInput(scope, "Native Date", "2026-05-20")
            await expectInputValue(scope, "Native Date", "2026-05-20")

            // A toast is a dialog too: only the day grid tells the popup from it
            await clickButton(section(page, "Toast Samples"), "Fire success toast")
            await pickDate(scope, "Custom Date", { year: 2026, month: 3, day: 12 })
            await expectDateInputValue(scope, "Custom Date", "2026")
            await expectToast(page, { type: "success" }, "Toast success description")
            await dismissToast(page, { type: "success" }, "Toast success description")
        })

        test("day picker", async ({ page }) => {
            const scope = section(page, "Day Picker Samples")
            const now = new Date()
            const isoMonth = String(now.getMonth() + 1).padStart(2, "0")
            await pickDayPickerDay(scope, 15)
            await expect(
                scope.getByText(
                    `Picked day: ${String(now.getFullYear())}-${isoMonth}-15`,
                ),
            ).toBeVisible()

            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            const nextMonthName = t(
                "ui",
                `Months.Full.${monthKeyOf(nextMonth.getMonth())}`,
            )
            await goToDayPickerNextMonth(scope)
            await expectDayPickerView(
                scope,
                `${nextMonthName} ${String(nextMonth.getFullYear())}`,
            )
        })

        test("dialog", async ({ page }) => {
            const scope = section(page, "Dialog Samples")
            const dialog = await openDialog(scope, "Open sample dialog", "Sample dialog")
            await expectDialogOpen(page, "Sample dialog")
            await expect(dialog.getByText("Sample dialog body")).toBeVisible()
            await fillInput(dialog, "Dialog Input", "hello")
            await expectInputValue(dialog, "Dialog Input", "hello")
            await closeDialog(page, "Sample dialog")
            await expectDialogClosed(page)

            // A toast is a dialog of its own, which no unnamed query must take for one
            await clickButton(section(page, "Toast Samples"), "Fire success toast")
            const dialogOverToast = await openDialog(scope, "Open sample dialog")
            await expect(dialogOverToast.getByText("Sample dialog body")).toBeVisible()
            await closeDialog(page)
            await expectDialogClosed(page)
            await expectToast(page, { type: "success" }, "Toast success description")
            await dismissToast(page, { type: "success" }, "Toast success description")
        })

        test("drawer", async ({ page }) => {
            const scope = section(page, "Drawer Samples")
            const drawer = await openDrawer(scope, "Open sample drawer", "Sample drawer")
            await expectDrawerOpen(page, "Sample drawer")
            await expect(drawer.getByText("Sample drawer body")).toBeVisible()
            await closeDrawer(page, "Sample drawer")
            await expectDrawerClosed(page)
        })

        test("fallback box", async ({ page }) => {
            const scope = section(page, "Fallback Box Samples")
            await expectEmptyFallback(scope)
            await expectErrorFallback(
                scope,
                "Fallback error title",
                "Fallback error description",
            )
        })

        test("form fields and view mode", async ({ page }) => {
            const scope = section(page, "Form Samples")
            // The form starts in view mode
            await expectFieldViewValue(scope, "View String", "View string value")
            await expectFieldViewSelection(scope, "View Checkbox", "selected")

            await clickButton(scope, "Toggle form mode")
            await expectInputValue(scope, "View String", "View string value")
            await expectCheckboxChecked(scope, "View Checkbox")
            await hoverFieldInfo(scope, "Described Input")
            await expectFieldDescription(scope, "Described input help text")
        })

        test("icon button", async ({ page }) => {
            const scope = section(page, "Icon Button Samples")
            await clickIconButton(scope, "Sample icon button")
            await expect(scope.getByText("Icon button clicks: 1")).toBeVisible()
        })

        test("input", async ({ page }) => {
            const scope = section(page, "Input Samples")
            await fillInput(scope, "Sample String Input", "hello world")
            await expectInputValue(scope, "Sample String Input", "hello world")
            await clearInput(scope, "Sample String Input")
            await expectInputValue(scope, "Sample String Input", "")

            await fillInputByPlaceholder(
                scope,
                "Placeholder Only Input",
                "via placeholder",
            )
            await expectInputValueByPlaceholder(
                scope,
                "Placeholder Only Input",
                "via placeholder",
            )
            await clearInputByPlaceholder(scope, "Placeholder Only Input")
            await expectInputValueByPlaceholder(scope, "Placeholder Only Input", "")

            await expectInputDisabled(scope, "Disabled Input")

            await fillInput(scope, "Sample Textarea", "first line")
            await expectInputValue(scope, "Sample Textarea", "first line")

            await fillInput(scope, "Sample Time Input", "14:30")
            await expectInputValue(scope, "Sample Time Input", "14:30")
        })

        test("menu", async ({ page }) => {
            const scope = section(page, "Menu Samples")
            await openMenu(scope, "Open sample menu")
            await expectMenuItems(page, ["Menu Action One", "Menu Action Two"])
            await clickMenuItem(scope, "Open sample menu", "Menu Action One")
            await expect(scope.getByText("Menu selected: one")).toBeVisible()
            await expectMenuClosed(page)
        })

        test("meter", async ({ page }) => {
            const scope = section(page, "Meter Samples")
            await expectMeterValue(scope, 40)
        })

        test("number input", async ({ page }) => {
            const scope = section(page, "Input Samples")
            await fillNumberInput(scope, "Sample Number", 42)
            await expectNumberInputValue(scope, "Sample Number", "42")
            await incrementNumberInput(scope, "Sample Number")
            await expectNumberInputValue(scope, "Sample Number", "43")
            await decrementNumberInput(scope, "Sample Number")
            await expectNumberInputValue(scope, "Sample Number", "42")

            // A negative value, then a value that replaces it rather than extending it
            await fillNumberInput(scope, "Sample Signed Number", -25)
            await expectNumberInputValue(scope, "Sample Signed Number", "-25")
            await fillNumberInput(scope, "Sample Signed Number", 7)
            await expectNumberInputValue(scope, "Sample Signed Number", "7")
        })

        test("otp input", async ({ page }) => {
            const scope = section(page, "OTP Input Samples")

            await expectOtpInputEmpty(scope, "Sample OTP Input", 4)
            await fillOtpInput(scope, "Sample OTP Input", "1234")
            await expectOtpInputValue(scope, "Sample OTP Input", "1234")
            await expect(scope.getByText("OTP completed: 1234")).toBeVisible()
            await clearOtpInput(scope, "Sample OTP Input", 4)

            await fillOtpInput(scope, "Grouped OTP Input", "246813")
            await expectOtpInputValue(scope, "Grouped OTP Input", "246813")

            await expectOtpInputMasked(scope, "Masked OTP Input")
            await fillOtpInput(scope, "Masked OTP Input", "5678")
            await expectOtpInputValue(scope, "Masked OTP Input", "5678")

            await expectOtpInputValue(scope, "Disabled OTP Input", "1234")
            await expectOtpInputDisabled(scope, "Disabled OTP Input", 4)
        })

        test("pagination", async ({ page }) => {
            const scope = section(page, "Pagination Samples")
            await expectCurrentPage(scope, 1)
            await goToPage(scope, 2)
            await expectCurrentPage(scope, 2)
            await goToNextPage(scope)
            await expectCurrentPage(scope, 3)
            await goToPreviousPage(scope)
            await expectCurrentPage(scope, 2)
            await goToPage(scope, 10)
            await expectCurrentPage(scope, 10)
            await expect(scope.getByText("Current page: 10")).toBeVisible()
        })

        test("password input", async ({ page }) => {
            const scope = section(page, "Input Samples")
            await fillPasswordInput(scope, "Sample Password", "s3cret-value")
            await expectPasswordHidden(scope, "Sample Password")
            await togglePasswordVisibility(scope, "Sample Password")
            await expectPasswordVisible(scope, "Sample Password")
            await expectInputValue(scope, "Sample Password", "s3cret-value")
            await togglePasswordVisibility(scope, "Sample Password")
            await expectPasswordHidden(scope, "Sample Password")
        })

        test("popover", async ({ page }) => {
            const scope = section(page, "Popover Samples")
            await openPopover(scope, "Open sample popover")
            await expectPopoverContent(page, "Sample popover body")
            await closePopover(page)
            await expectPopoverClosed(page)
        })

        test("progress", async ({ page }) => {
            const scope = section(page, "Progress Samples")
            await expectProgressValue(scope, 60)
            await expectProgressComplete(scope)
        })

        test("radio", async ({ page }) => {
            const scope = section(page, "Radio Samples")
            await expectRadioNotSelected(scope, "Apple")
            await selectRadioItem(scope, "Banana")
            await expectRadioSelected(scope, "Banana")
            await selectRadioItem(scope, "Cherry")
            await expectRadioSelected(scope, "Cherry")
            await expectRadioNotSelected(scope, "Banana")
        })

        test("search field", async ({ page }) => {
            const scope = section(page, "Search Field Samples")
            await expect(
                scope.getByPlaceholder("Sample search placeholder"),
            ).toBeVisible()
            await fillSearchField(scope, "Sample search", "jazz")
            await expect(scope.getByText("Search value: jazz")).toBeVisible()
            await resetSearchField(scope, "Sample search")
            await expectSearchFieldValue(scope, "Sample search", "")
        })

        test("select", async ({ page }) => {
            const scope = section(page, "Select Samples")

            await expectSelectPlaceholder(scope, "Select Single Fruit")
            await expectSelectOptions(scope, "Select Single Fruit", [
                "Apple",
                "Banana",
                "Cherry",
            ])
            await selectSelectItem(scope, "Select Single Fruit", ["exact", "Apple"])
            await expectSelectValue(scope, "Select Single Fruit", "Apple")
            // Idempotent: an already-selected item causes no reopen
            await selectSelectItem(scope, "Select Single Fruit", ["exact", "Apple"])
            await selectSelectItem(scope, "Select Single Fruit", ["contains", "Banan"])
            await expectSelectValue(scope, "Select Single Fruit", "Banana")
            await resetSelect(scope, "Select Single Fruit")
            await expectSelectPlaceholder(scope, "Select Single Fruit")

            await selectSelectItems(scope, "Select Multiple Fruits", [
                ["exact", "Apple"],
                ["exact", "Cherry"],
            ])
            await expectSelectValue(scope, "Select Multiple Fruits", "Apple")
        })

        test("separator", async ({ page }) => {
            const scope = section(page, "Separator Samples")
            await expectSeparator(scope)
        })

        test("slider", async ({ page }) => {
            const scope = section(page, "Slider Samples")
            await setSliderValue(scope, "Sample Slider", 60)
            await expectSliderValue(scope, "Sample Slider", 60)
            await expect(scope.getByText("Slider value: 60")).toBeVisible()
        })

        test("spinner", async ({ page }) => {
            const scope = section(page, "Spinner Samples")
            await expectSpinner(scope, "Sample spinner")
        })

        test("stat grid", async ({ page }) => {
            const scope = section(page, "Stat Grid Samples")
            await expectStatGridValue(scope, "Sample stat date", "Sample stat Wed 14.10")
            await expectStatGridValue(scope, "Sample stat entry", "Sample stat free")
        })

        test("stepper", async ({ page }) => {
            const scope = section(page, "Stepper Samples")
            await expectCurrentStep(scope, "Step Two")
            await expectStepStatus(scope, {
                number: 1,
                label: "Step One",
                status: "completed",
            })
            await expectStepStatus(scope, {
                number: 2,
                label: "Step Two",
                status: "partial",
            })
            await expectStepStatus(scope, {
                number: 3,
                label: "Step Three",
                status: "not-started",
            })
            await expectStepDisabled(scope, "Step Four")
            await goToStep(scope, "Step Three")
            await expectCurrentStep(scope, "Step Three")
        })

        test("switch", async ({ page }) => {
            const scope = section(page, "Switch Samples")
            await expectSwitchOff(scope, "Sample Switch")
            await switchOn(scope, "Sample Switch")
            await expectSwitchOn(scope, "Sample Switch")
            await switchOff(scope, "Sample Switch")
            await expectSwitchOff(scope, "Sample Switch")
        })

        test("table", async ({ page }) => {
            const scope = section(page, "Table Samples")
            const filledTable = getTable(scope, { header: "Actions" })

            await expectTableHeaders(filledTable, ["Name", "Color", "Actions"])
            await expectTableRowCount(filledTable, 3)
            await expectTableRow(filledTable, ["exact", "Apple"])
            await expectTableRow(filledTable, [
                ["exact", "Banana"],
                ["contains", "Yellow"],
            ])

            await clickTableRowAction(filledTable, ["exact", "Banana"], "Remove Banana")
            await expectNoTableRow(filledTable, ["exact", "Banana"])
            await expectTableRowCount(filledTable, 2)

            await expectTableEmpty(scope)
        })

        test("tabs", async ({ page }) => {
            const scope = section(page, "Tabs Samples")
            await expectSelectedTab(scope, "Tab One")
            await expectTabPanelContent(scope, "Tab one panel content")
            await selectTab(scope, "Tab Two")
            await expectSelectedTab(scope, "Tab Two")
            await expectTabPanelContent(scope, "Tab two panel content")
        })

        test("tick progress", async ({ page }) => {
            const scope = section(page, "Tick Progress Samples")
            await expectTickProgress(scope, "Sample tick progress", {
                value: 30,
                valueText: "Sample tick value text",
            })
        })

        test("timeline", async ({ page }) => {
            const scope = section(page, "Timeline Samples")
            await expectTimeline(scope, "Sample timeline", {
                start: "Sample timeline start",
                now: "Sample timeline now",
                end: "Sample timeline end",
            })
            await expectTickProgress(scope, "Sample timeline", {
                value: 48,
                valueText: "Sample timeline value text",
            })
        })

        test("toast", async ({ page }) => {
            const scope = section(page, "Toast Samples")

            await clickButton(scope, "Fire success toast")
            await expectToast(page, { type: "success" }, "Toast success description")
            await dismissToast(page, { type: "success" }, "Toast success description")

            await clickButton(scope, "Fire warning toast")
            await expectToast(page, { type: "warning" }, "Toast warning description")
            await dismissToast(page, { type: "warning" }, "Toast warning description")

            await clickButton(scope, "Fire error toast")
            await expectToast(page, { type: "error" }, "Toast error description")
            await dismissToast(page, { type: "error" }, "Toast error description")

            await clickButton(scope, "Fire info toast")
            await expectToast(
                page,
                { title: "Sample info toast" },
                "Toast info description",
            )
            await dismissToast(
                page,
                { title: "Sample info toast" },
                "Toast info description",
            )

            // Dismissed between the two actions: the same toast twice over must not
            // leave a stack that a later assertion reads as the first one
            await clickButton(scope, "Fire success toast")
            await expectToast(page, { type: "success" }, "Toast success description")
            await dismissToast(page, { type: "success" }, "Toast success description")
            await clickButton(scope, "Fire success toast")
            await expectToast(page, { type: "success" }, "Toast success description")
            await dismissToast(page, { type: "success" }, "Toast success description")
        })

        test("toggle", async ({ page }) => {
            const scope = section(page, "Toggle Samples")
            await expectToggleNotPressed(scope, "Sample Toggle")
            await pressToggle(scope, "Sample Toggle")
            await expectTogglePressed(scope, "Sample Toggle")
            await unpressToggle(scope, "Sample Toggle")
            await expectToggleNotPressed(scope, "Sample Toggle")

            await pressToggle(scope, "Banana Toggle")
            await expectTogglePressed(scope, "Banana Toggle")
            await pressToggle(scope, "Apple Toggle")
            // Single toggle group: the previous item unpresses on its own
            await expectToggleNotPressed(scope, "Banana Toggle")
        })

        test("tooltip", async ({ page }) => {
            const scope = section(page, "Tooltip Samples")
            await hoverTooltipTrigger(
                scope.getByRole("button", {
                    name: "Tooltip trigger button",
                    exact: true,
                }),
            )
            await expectTooltip(page, "Sample tooltip content")

            await unhoverTooltip(page)
            await expectTooltipHidden(page, "Sample tooltip content")
        })
    })
}
