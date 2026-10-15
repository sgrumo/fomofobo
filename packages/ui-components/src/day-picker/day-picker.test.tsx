import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import type { Month } from "shared/temporal"
import { months, weekDays } from "shared/temporal"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { queryFieldError, submitFieldCallbacksForm } from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import { DayPicker } from "./day-picker"

const monthFullLabel = (month: Month) => t(`Months.Full.${month}`, undefined)
const monthShortLabel = (month: Month) => t(`Months.Short.${month}`, undefined)
/**
 * @description Returns the month key of the value
 * @param value Date holding the month
 */
const monthKeyOf = (value: Date): Month => months[value.getMonth()] ?? "january"
/**
 * @description Returns the accessible name of the day-view header
 * @param value Date shown by the header
 */
const dayHeaderName = (value: Date) =>
    `${monthFullLabel(monthKeyOf(value))} ${value.getFullYear()}`
const monthHeaderName = (value: Date) => String(value.getFullYear())

const enterMonthView = async (user: ReturnType<typeof userEvent.setup>, value: Date) => {
    await user.click(screen.getByRole("button", { name: dayHeaderName(value) }))
}
/**
 * @description Returns a promise resolving after the year view opens
 * @param user Simulated user driving the clicks
 * @param value Date naming the day and month headers
 */
const enterYearView = async (user: ReturnType<typeof userEvent.setup>, value: Date) => {
    await enterMonthView(user, value)
    await user.click(screen.getByRole("button", { name: monthHeaderName(value) }))
}

/**
 * @description Returns the grid cell holding the roving tabindex, after focusing it
 * @remarks Yields `undefined` and moves no focus when no cell holds the tabindex
 */
const focusActiveCell = () => {
    const cell = screen
        .getAllByRole("gridcell")
        .find(candidate => candidate.tabIndex === 0)
    cell?.focus()
    return cell
}

describe("DayPicker", () => {
    describe("day view", () => {
        it("shows the value's month and year as a clickable header", () => {
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            expect(
                screen.getByRole("button", { name: `${monthFullLabel("july")} 2024` }),
            ).toBeInTheDocument()
        })

        it("renders the calendar as a grid labeled by the visible period", () => {
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            expect(
                screen.getByRole("grid", { name: `${monthFullLabel("july")} 2024` }),
            ).toBeInTheDocument()
        })

        it("renders the seven weekday column headers", () => {
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            for (const weekDay of weekDays) {
                expect(
                    screen.getByRole("columnheader", {
                        name: t(`Days.Full.${weekDay}`, undefined),
                    }),
                ).toBeInTheDocument()
            }
        })

        it("renders accessible labels for the prev/next chevrons", () => {
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            expect(
                screen.getByRole("button", {
                    name: t("DayPicker.PreviousMonth", undefined),
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole("button", { name: t("DayPicker.NextMonth", undefined) }),
            ).toBeInTheDocument()
        })

        it("marks the selected day with aria-selected=true", () => {
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            expect(
                screen.getByRole("gridcell", { name: "15", selected: true }),
            ).toBeInTheDocument()
        })

        it("does not mark non-selected days as selected", () => {
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            expect(
                screen.getByRole("gridcell", { name: "20", selected: false }),
            ).toBeInTheDocument()
        })

        it("disables days that fall outside the visible month", () => {
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            // July 2024 has Jun 30 as its leading day and Jul 30 inside the month
            const [leading, current] = screen.getAllByRole("gridcell", { name: "30" })
            expect(leading).toHaveAttribute("aria-disabled", "true")
            expect(current).toHaveAttribute("aria-disabled", "false")
        })

        it("disables days before min", () => {
            render(
                <DayPicker
                    value={new Date(2024, 6, 15, 12)}
                    onValueChange={noop}
                    min={new Date(2024, 6, 10)}
                />,
            )

            expect(screen.getByRole("gridcell", { name: "9" })).toHaveAttribute(
                "aria-disabled",
                "true",
            )
            expect(screen.getByRole("gridcell", { name: "10" })).toHaveAttribute(
                "aria-disabled",
                "false",
            )
        })

        it("disables days after max", () => {
            render(
                <DayPicker
                    value={new Date(2024, 6, 15, 12)}
                    onValueChange={noop}
                    max={new Date(2024, 6, 20, 23, 59, 59)}
                />,
            )

            expect(screen.getByRole("gridcell", { name: "20" })).toHaveAttribute(
                "aria-disabled",
                "false",
            )
            expect(screen.getByRole("gridcell", { name: "21" })).toHaveAttribute(
                "aria-disabled",
                "true",
            )
        })

        it("calls onValueChange with the clicked day", async () => {
            const user = userEvent.setup()
            const handleChange = vi.fn<(value: Date) => void>()
            render(
                <DayPicker
                    value={new Date(2024, 6, 15, 12)}
                    onValueChange={handleChange}
                />,
            )

            await user.click(screen.getByRole("gridcell", { name: "20" }))

            expect(handleChange).toHaveBeenCalledExactlyOnceWith(new Date(2024, 6, 20))
        })

        it("does not call onValueChange when a disabled day is clicked", async () => {
            const user = userEvent.setup()
            const handleChange = vi.fn<(value: Date) => void>()
            render(
                <DayPicker
                    value={new Date(2024, 6, 15, 12)}
                    onValueChange={handleChange}
                    min={new Date(2024, 6, 10)}
                />,
            )

            await user.click(screen.getByRole("gridcell", { name: "9" }))

            expect(handleChange).not.toHaveBeenCalled()
        })

        it("does not call onValueChange when a day disabled via isDayDisabled is clicked", async () => {
            const user = userEvent.setup()
            const handleChange = vi.fn<(value: Date) => void>()
            render(
                <DayPicker
                    value={new Date(2024, 6, 15, 12)}
                    onValueChange={handleChange}
                    isDayDisabled={d => d.getDate() === 20}
                />,
            )

            await user.click(screen.getByRole("gridcell", { name: "20" }))

            expect(handleChange).not.toHaveBeenCalled()
        })

        it("navigates to the previous month when prev is clicked", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            await user.click(
                screen.getByRole("button", {
                    name: t("DayPicker.PreviousMonth", undefined),
                }),
            )

            expect(
                screen.getByRole("button", { name: `${monthFullLabel("june")} 2024` }),
            ).toBeInTheDocument()
        })

        it("navigates to the next month when next is clicked", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            await user.click(
                screen.getByRole("button", { name: t("DayPicker.NextMonth", undefined) }),
            )

            expect(
                screen.getByRole("button", { name: `${monthFullLabel("august")} 2024` }),
            ).toBeInTheDocument()
        })

        it("disables prev when the previous month is entirely below min", () => {
            render(
                <DayPicker
                    value={new Date(2024, 6, 15, 12)}
                    onValueChange={noop}
                    min={new Date(2024, 6, 1)}
                />,
            )

            expect(
                screen.getByRole("button", {
                    name: t("DayPicker.PreviousMonth", undefined),
                }),
            ).toBeDisabled()
        })

        it("disables next when the next month is entirely above max", () => {
            render(
                <DayPicker
                    value={new Date(2024, 6, 15, 12)}
                    onValueChange={noop}
                    max={new Date(2024, 6, 31, 23, 59, 59)}
                />,
            )

            expect(
                screen.getByRole("button", { name: t("DayPicker.NextMonth", undefined) }),
            ).toBeDisabled()
        })

        it("switches to month view when the header is clicked", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            await user.click(
                screen.getByRole("button", { name: `${monthFullLabel("july")} 2024` }),
            )

            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("july") }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("december") }),
            ).toBeInTheDocument()
            expect(screen.getByRole("button", { name: "2024" })).toBeInTheDocument()
        })

        it("keeps focus on the prev button after clicking it", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            await user.click(
                screen.getByRole("button", {
                    name: t("DayPicker.PreviousMonth", undefined),
                }),
            )

            expect(
                screen.getByRole("button", {
                    name: t("DayPicker.PreviousMonth", undefined),
                }),
            ).toHaveFocus()
        })

        it("keeps focus on the next button after clicking it", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            await user.click(
                screen.getByRole("button", { name: t("DayPicker.NextMonth", undefined) }),
            )

            expect(
                screen.getByRole("button", { name: t("DayPicker.NextMonth", undefined) }),
            ).toHaveFocus()
        })

        it("keeps focus on the header button after clicking it to cycle view", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            await user.click(
                screen.getByRole("button", { name: `${monthFullLabel("july")} 2024` }),
            )

            // Header is now "2024" — the same button with updated text
            expect(screen.getByRole("button", { name: "2024" })).toHaveFocus()
        })

        it("marks today with aria-current=date", () => {
            const today = new Date()
            render(<DayPicker value={today} onValueChange={noop} />)

            const todayCell = screen.getByRole("gridcell", {
                name: String(today.getDate()),
                selected: true,
            })
            expect(todayCell).toHaveAttribute("aria-current", "date")
        })
    })

    describe("month view", () => {
        const value = new Date(2024, 6, 15, 12)

        it("renders all twelve months with translated short labels", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)

            for (const month of months) {
                expect(
                    screen.getByRole("gridcell", { name: monthShortLabel(month) }),
                ).toBeInTheDocument()
            }
        })

        it("shows the year as a clickable header", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)

            expect(screen.getByRole("button", { name: "2024" })).toBeInTheDocument()
        })

        it("marks the selected month with aria-selected=true", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)

            expect(
                screen.getByRole("gridcell", {
                    name: monthShortLabel("july"),
                    selected: true,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole("gridcell", {
                    name: monthShortLabel("june"),
                    selected: false,
                }),
            ).toBeInTheDocument()
        })

        it("does not mark any month as selected when the visible year differs from value's year", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)

            await user.click(
                screen.getByRole("button", {
                    name: t("DayPicker.PreviousYear", undefined),
                }),
            )

            // Year 2023 view: value's month (Jul) is not selected
            expect(
                screen.queryByRole("gridcell", {
                    name: monthShortLabel("july"),
                    selected: true,
                }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole("gridcell", {
                    name: monthShortLabel("july"),
                    selected: false,
                }),
            ).toBeInTheDocument()
        })

        it("switches to day view of the chosen month when clicked", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)

            await user.click(
                screen.getByRole("gridcell", { name: monthShortLabel("march") }),
            )

            expect(
                screen.getByRole("button", { name: `${monthFullLabel("march")} 2024` }),
            ).toBeInTheDocument()
        })

        it("disables months entirely before min", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    min={new Date(2024, 6, 1)}
                />,
            )
            await enterMonthView(user, value)

            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("june") }),
            ).toHaveAttribute("aria-disabled", "true")
            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("july") }),
            ).toHaveAttribute("aria-disabled", "false")
        })

        it("disables months entirely after max", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    max={new Date(2024, 6, 31, 23, 59, 59)}
                />,
            )
            await enterMonthView(user, value)

            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("july") }),
            ).toHaveAttribute("aria-disabled", "false")
            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("august") }),
            ).toHaveAttribute("aria-disabled", "true")
        })

        it("does not disable a month that contains at least one day at or after min", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    min={new Date(2024, 6, 15)}
                />,
            )
            await enterMonthView(user, value)

            // July is partially below min (Jul 1-14) but Jul 15-31 are valid
            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("july") }),
            ).toHaveAttribute("aria-disabled", "false")
        })

        it("does not disable a month that contains at least one day at or before max", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    max={new Date(2024, 6, 15)}
                />,
            )
            await enterMonthView(user, value)

            // July is partially above max (Jul 16-31) but Jul 1-15 are valid
            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("july") }),
            ).toHaveAttribute("aria-disabled", "false")
        })

        it("navigates to the previous year when prev is clicked", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)

            await user.click(
                screen.getByRole("button", {
                    name: t("DayPicker.PreviousYear", undefined),
                }),
            )

            expect(screen.getByRole("button", { name: "2023" })).toBeInTheDocument()
        })

        it("navigates to the next year when next is clicked", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)

            await user.click(
                screen.getByRole("button", { name: t("DayPicker.NextYear", undefined) }),
            )

            expect(screen.getByRole("button", { name: "2025" })).toBeInTheDocument()
        })

        it("switches to year view when the header is clicked", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)

            await user.click(screen.getByRole("button", { name: "2024" }))

            expect(screen.getAllByRole("gridcell")).toHaveLength(9)
        })
    })

    describe("year view", () => {
        const value = new Date(2020, 6, 15, 12)

        it("renders nine year cells by default", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterYearView(user, value)

            expect(screen.getAllByRole("gridcell")).toHaveLength(9)
        })

        it("renders the configured number of year cells when yearStep is set", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} yearStep={5} />)
            await enterYearView(user, value)

            expect(screen.getAllByRole("gridcell")).toHaveLength(5)
        })

        it("aligns the visible window to multiples of yearStep", async () => {
            const user = userEvent.setup()
            // Value year 2022 with step 5 → window starts at floor(2022/5)*5 = 2020
            render(
                <DayPicker
                    value={new Date(2022, 6, 15, 12)}
                    onValueChange={noop}
                    yearStep={5}
                />,
            )
            await enterYearView(user, new Date(2022, 6, 15, 12))

            expect(screen.getByText("2020 - 2024")).toBeInTheDocument()
        })

        it("renders the year-range header as a non-interactive element", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterYearView(user, value)

            const range = screen.getByText(/^\d{1,4} - \d{1,4}$/u)
            expect(range.tagName).toBe("SPAN")
        })

        it("marks the selected year with aria-selected=true", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterYearView(user, value)

            expect(
                screen.getByRole("gridcell", { name: "2020", selected: true }),
            ).toBeInTheDocument()
        })

        it("switches to month view of the chosen year when clicked", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterYearView(user, value)

            await user.click(screen.getByRole("gridcell", { name: "2020" }))

            // Month view shows the chosen year as the clickable header
            expect(screen.getByRole("button", { name: "2020" })).toBeInTheDocument()
            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("january") }),
            ).toBeInTheDocument()
        })

        it("disables years entirely before min", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    min={new Date(2018, 0, 1)}
                />,
            )
            await enterYearView(user, value)

            expect(screen.getByRole("gridcell", { name: "2017" })).toHaveAttribute(
                "aria-disabled",
                "true",
            )
            expect(screen.getByRole("gridcell", { name: "2018" })).toHaveAttribute(
                "aria-disabled",
                "false",
            )
        })

        it("disables years entirely after max", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    max={new Date(2020, 11, 31, 23, 59, 59)}
                />,
            )
            await enterYearView(user, value)

            expect(screen.getByRole("gridcell", { name: "2020" })).toHaveAttribute(
                "aria-disabled",
                "false",
            )
            expect(screen.getByRole("gridcell", { name: "2021" })).toHaveAttribute(
                "aria-disabled",
                "true",
            )
        })

        it("does not disable a year that contains at least one day at or after min", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    min={new Date(2020, 6, 15)}
                />,
            )
            await enterYearView(user, value)

            // 2020 is partially below min (Jan 1 - Jul 14) but Jul 15 - Dec 31 are valid
            expect(screen.getByRole("gridcell", { name: "2020" })).toHaveAttribute(
                "aria-disabled",
                "false",
            )
        })

        it("does not disable a year that contains at least one day at or before max", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    max={new Date(2020, 6, 15)}
                />,
            )
            await enterYearView(user, value)

            // 2020 is partially above max (Jul 16 - Dec 31) but Jan 1 - Jul 15 are valid
            expect(screen.getByRole("gridcell", { name: "2020" })).toHaveAttribute(
                "aria-disabled",
                "false",
            )
        })

        it("navigates back nine years when prev is clicked", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterYearView(user, value)

            const initial = screen.getByText(/^\d{1,4} - \d{1,4}$/u).textContent
            await user.click(
                screen.getByRole("button", {
                    name: t("DayPicker.PreviousYears", undefined),
                }),
            )
            const after = screen.getByText(/^\d{1,4} - \d{1,4}$/u).textContent

            expect(after).not.toBe(initial)
            expect(screen.getAllByRole("gridcell")).toHaveLength(9)
        })

        it("navigates forward nine years when next is clicked", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterYearView(user, value)

            const initial = screen.getByText(/^\d{1,4} - \d{1,4}$/u).textContent
            await user.click(
                screen.getByRole("button", {
                    name: t("DayPicker.NextYears", undefined),
                }),
            )
            const after = screen.getByText(/^\d{1,4} - \d{1,4}$/u).textContent

            expect(after).not.toBe(initial)
            expect(screen.getAllByRole("gridcell")).toHaveLength(9)
        })

        it("navigates by yearStep when configured", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={new Date(2022, 6, 15, 12)}
                    onValueChange={noop}
                    yearStep={5}
                />,
            )
            await enterYearView(user, new Date(2022, 6, 15, 12))

            await user.click(
                screen.getByRole("button", {
                    name: t("DayPicker.NextYears", undefined),
                }),
            )
            expect(screen.getByText("2025 - 2029")).toBeInTheDocument()

            await user.click(
                screen.getByRole("button", {
                    name: t("DayPicker.PreviousYears", undefined),
                }),
            )
            await user.click(
                screen.getByRole("button", {
                    name: t("DayPicker.PreviousYears", undefined),
                }),
            )
            expect(screen.getByText("2015 - 2019")).toBeInTheDocument()
        })

        it("displays the correct year cells for values below year 100", async () => {
            const user = userEvent.setup()
            const lowYearValue = new Date(2000, 5, 15, 12)
            lowYearValue.setFullYear(50)

            render(<DayPicker value={lowYearValue} onValueChange={noop} />)
            await enterYearView(user, lowYearValue)

            // For value year 50, the range is 45 - 53 with year 50 selected
            expect(
                screen.getByRole("gridcell", { name: "50", selected: true }),
            ).toBeInTheDocument()
            expect(screen.getByText("45 - 53")).toBeInTheDocument()
        })
    })

    describe("roving tabindex", () => {
        it("places only the focused day in the tab sequence", () => {
            render(<DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />)

            const focusable = screen
                .getAllByRole("gridcell")
                .filter(cell => cell.tabIndex === 0)
            expect(focusable).toHaveLength(1)
            expect(focusable[0]).toHaveTextContent("15")
        })

        it("places only the focused month in the tab sequence", async () => {
            const user = userEvent.setup()
            const value = new Date(2024, 6, 15, 12)
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)

            const focusable = screen
                .getAllByRole("gridcell")
                .filter(cell => cell.tabIndex === 0)
            expect(focusable).toHaveLength(1)
            expect(focusable[0]).toHaveTextContent(monthShortLabel("july"))
        })

        it("places only the focused year in the tab sequence", async () => {
            const user = userEvent.setup()
            const value = new Date(2020, 6, 15, 12)
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterYearView(user, value)

            const focusable = screen
                .getAllByRole("gridcell")
                .filter(cell => cell.tabIndex === 0)
            expect(focusable).toHaveLength(1)
            expect(focusable[0]).toHaveTextContent("2020")
        })
    })

    describe("keyboard navigation in day view", () => {
        // July 15, 2024 (Monday)
        const value = new Date(2024, 6, 15, 12)

        it("ArrowRight moves focus one day forward", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            focusActiveCell()

            await user.keyboard("{ArrowRight}")

            expect(screen.getByRole("gridcell", { name: "16" })).toHaveFocus()
        })

        it("ArrowLeft moves focus one day backward", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            focusActiveCell()

            await user.keyboard("{ArrowLeft}")

            expect(screen.getByRole("gridcell", { name: "14" })).toHaveFocus()
        })

        it("ArrowDown moves focus one week forward", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            focusActiveCell()

            await user.keyboard("{ArrowDown}")

            expect(screen.getByRole("gridcell", { name: "22" })).toHaveFocus()
        })

        it("ArrowUp moves focus one week backward", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            focusActiveCell()

            await user.keyboard("{ArrowUp}")

            expect(screen.getByRole("gridcell", { name: "8" })).toHaveFocus()
        })

        it("Home moves focus to the start of the current week", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            focusActiveCell()

            await user.keyboard("{Home}")

            // July 15, 2024 is a Monday → start of week (Sunday) is Jul 14
            expect(screen.getByRole("gridcell", { name: "14" })).toHaveFocus()
        })

        it("End moves focus to the end of the current week", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            focusActiveCell()

            await user.keyboard("{End}")

            // End of week (Saturday) is Jul 20
            expect(screen.getByRole("gridcell", { name: "20" })).toHaveFocus()
        })

        it("PageDown advances by one month and moves focus to the same day", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            focusActiveCell()

            await user.keyboard("{PageDown}")

            expect(
                screen.getByRole("button", { name: `${monthFullLabel("august")} 2024` }),
            ).toBeInTheDocument()
            const augustFifteen = screen
                .getAllByRole("gridcell", { name: "15" })
                .find(cell => cell.tabIndex === 0)
            expect(augustFifteen).toHaveFocus()
        })

        it("PageUp goes back by one month", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            focusActiveCell()

            await user.keyboard("{PageUp}")

            expect(
                screen.getByRole("button", { name: `${monthFullLabel("june")} 2024` }),
            ).toBeInTheDocument()
        })

        it("Shift+PageDown advances by one year", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            focusActiveCell()

            await user.keyboard("{Shift>}{PageDown}{/Shift}")

            expect(
                screen.getByRole("button", { name: `${monthFullLabel("july")} 2025` }),
            ).toBeInTheDocument()
        })

        it("Shift+PageUp goes back by one year", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            focusActiveCell()

            await user.keyboard("{Shift>}{PageUp}{/Shift}")

            expect(
                screen.getByRole("button", { name: `${monthFullLabel("july")} 2023` }),
            ).toBeInTheDocument()
        })

        it("Enter on a focused day calls onValueChange", async () => {
            const user = userEvent.setup()
            const handleChange = vi.fn<(value: Date) => void>()
            render(<DayPicker value={value} onValueChange={handleChange} />)
            focusActiveCell()

            await user.keyboard("{ArrowRight}{Enter}")

            expect(handleChange).toHaveBeenCalledWith(new Date(2024, 6, 16))
        })

        it("snaps focus to min when ArrowLeft would land below min", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    min={new Date(2024, 6, 15)}
                />,
            )
            focusActiveCell()

            await user.keyboard("{ArrowLeft}")

            // Jul 14 falls below min; focus snaps to min (Jul 15) → no movement
            expect(screen.getByRole("gridcell", { name: "15" })).toHaveFocus()
        })

        it("snaps focus to min when ArrowUp would land below min", async () => {
            const user = userEvent.setup()
            // User's example: focused on Jan 13 with min Jan 8 → ArrowUp lands on Jan 8
            const valueAtJan13 = new Date(2026, 0, 13, 12)
            render(
                <DayPicker
                    value={valueAtJan13}
                    onValueChange={noop}
                    min={new Date(2026, 0, 8)}
                />,
            )
            focusActiveCell()

            await user.keyboard("{ArrowUp}")

            expect(screen.getByRole("gridcell", { name: "8" })).toHaveFocus()
        })

        it("snaps focus to max when ArrowRight would land above max", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    max={new Date(2024, 6, 15, 23, 59, 59)}
                />,
            )
            focusActiveCell()

            await user.keyboard("{ArrowRight}")

            expect(screen.getByRole("gridcell", { name: "15" })).toHaveFocus()
        })

        it("snaps focus to max when ArrowDown would land above max", async () => {
            const user = userEvent.setup()
            const valueAtJan13 = new Date(2026, 0, 13, 12)
            render(
                <DayPicker
                    value={valueAtJan13}
                    onValueChange={noop}
                    max={new Date(2026, 0, 16, 23, 59, 59)}
                />,
            )
            focusActiveCell()

            await user.keyboard("{ArrowDown}")

            expect(screen.getByRole("gridcell", { name: "16" })).toHaveFocus()
        })

        it("ArrowRight skips a day disabled via isDayDisabled", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    isDayDisabled={d => d.getDate() === 16}
                />,
            )
            focusActiveCell()

            await user.keyboard("{ArrowRight}")

            expect(screen.getByRole("gridcell", { name: "17" })).toHaveFocus()
        })

        it("ArrowLeft skips a day disabled via isDayDisabled", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    isDayDisabled={d => d.getDate() === 14}
                />,
            )
            focusActiveCell()

            await user.keyboard("{ArrowLeft}")

            expect(screen.getByRole("gridcell", { name: "13" })).toHaveFocus()
        })

        it("ArrowRight skips a run of days disabled via isDayDisabled", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    isDayDisabled={d => d.getDate() % 2 === 0}
                />,
            )
            focusActiveCell()

            // Jul 15 (odd, focused) → Jul 16 (even, disabled) → Jul 17 (odd)
            await user.keyboard("{ArrowRight}")

            expect(screen.getByRole("gridcell", { name: "17" })).toHaveFocus()
        })

        it("does not move focus when no enabled day exists before min", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    min={new Date(2024, 6, 14)}
                    isDayDisabled={d => d.getDate() === 14}
                />,
            )
            focusActiveCell()

            await user.keyboard("{ArrowLeft}")

            // Jul 14 disabled, Jul 13 below min → stay on Jul 15
            expect(screen.getByRole("gridcell", { name: "15" })).toHaveFocus()
        })

        it("terminates when isDayDisabled acts as an unbounded barrier below the focus", async () => {
            const user = userEvent.setup()
            const cutoff = new Date(2024, 6, 15)
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    isDayDisabled={d => d.getTime() < cutoff.getTime()}
                />,
            )
            focusActiveCell()

            // No min set; every day to the left is disabled. The scan must abort
            // Via the year cap rather than looping forever
            await user.keyboard("{ArrowLeft}")

            expect(screen.getByRole("gridcell", { name: "15" })).toHaveFocus()
        })

        it("terminates when isDayDisabled acts as an unbounded barrier above the focus", async () => {
            const user = userEvent.setup()
            const cutoff = new Date(2024, 6, 15)
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    isDayDisabled={d => d.getTime() > cutoff.getTime()}
                />,
            )
            focusActiveCell()

            await user.keyboard("{ArrowRight}")

            expect(screen.getByRole("gridcell", { name: "15" })).toHaveFocus()
        })

        it("snaps focus to min via PageUp when target month is below min", async () => {
            const user = userEvent.setup()
            render(
                <DayPicker
                    value={value}
                    onValueChange={noop}
                    min={new Date(2024, 6, 1)}
                />,
            )
            focusActiveCell()

            await user.keyboard("{PageUp}")

            // PageUp from Jul 15 with min Jul 1 → Jun 15 (below min) → snaps to Jul 1
            const focused = screen
                .getAllByRole("gridcell")
                .find(cell => cell.tabIndex === 0)
            expect(focused).toHaveTextContent("1")
            expect(focused).toHaveFocus()
        })
    })

    describe("keyboard navigation in month view", () => {
        // July 2024
        const value = new Date(2024, 6, 15, 12)

        it("ArrowRight moves focus to the next month", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)
            focusActiveCell()

            await user.keyboard("{ArrowRight}")

            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("august") }),
            ).toHaveFocus()
        })

        it("ArrowDown moves focus down one row (three months)", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)
            focusActiveCell()

            await user.keyboard("{ArrowDown}")

            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("october") }),
            ).toHaveFocus()
        })

        it("PageDown advances by one year", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterMonthView(user, value)
            focusActiveCell()

            await user.keyboard("{PageDown}")

            expect(screen.getByRole("button", { name: "2025" })).toBeInTheDocument()
        })

        it("ArrowRight at December advances to January of the next year", async () => {
            const user = userEvent.setup()
            const december = new Date(2024, 11, 15, 12)
            render(<DayPicker value={december} onValueChange={noop} />)
            await enterMonthView(user, december)
            focusActiveCell()

            await user.keyboard("{ArrowRight}")

            expect(screen.getByRole("button", { name: "2025" })).toBeInTheDocument()
            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("january") }),
            ).toHaveFocus()
        })

        it("ArrowLeft at January advances to December of the previous year", async () => {
            const user = userEvent.setup()
            const january = new Date(2024, 0, 15, 12)
            render(<DayPicker value={january} onValueChange={noop} />)
            await enterMonthView(user, january)
            focusActiveCell()

            await user.keyboard("{ArrowLeft}")

            expect(screen.getByRole("button", { name: "2023" })).toBeInTheDocument()
            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("december") }),
            ).toHaveFocus()
        })

        it("snaps focus to max month when ArrowRight would cross max", async () => {
            const user = userEvent.setup()
            const december = new Date(2024, 11, 15, 12)
            render(
                <DayPicker
                    value={december}
                    onValueChange={noop}
                    max={new Date(2024, 11, 31, 23, 59, 59)}
                />,
            )
            await enterMonthView(user, december)
            focusActiveCell()

            await user.keyboard("{ArrowRight}")

            expect(
                screen.getByRole("gridcell", { name: monthShortLabel("december") }),
            ).toHaveFocus()
        })
    })

    describe("keyboard navigation in year view", () => {
        const value = new Date(2020, 6, 15, 12)

        it("ArrowRight moves focus to the next year", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterYearView(user, value)
            focusActiveCell()

            await user.keyboard("{ArrowRight}")

            expect(screen.getByRole("gridcell", { name: "2021" })).toHaveFocus()
        })

        it("PageDown advances to the next year window", async () => {
            const user = userEvent.setup()
            render(<DayPicker value={value} onValueChange={noop} />)
            await enterYearView(user, value)
            focusActiveCell()

            await user.keyboard("{PageDown}")

            expect(screen.getByText("2025 - 2033")).toBeInTheDocument()
        })

        it("ArrowRight at the end of the window advances to the next window's first year", async () => {
            const user = userEvent.setup()
            const lastInWindow = new Date(2024, 6, 15, 12)
            render(<DayPicker value={lastInWindow} onValueChange={noop} />)
            await enterYearView(user, lastInWindow)
            focusActiveCell()

            await user.keyboard("{ArrowRight}")

            expect(screen.getByText("2025 - 2033")).toBeInTheDocument()
            expect(screen.getByRole("gridcell", { name: "2025" })).toHaveFocus()
        })

        it("ArrowLeft at the start of the window advances to the previous window's last year", async () => {
            const user = userEvent.setup()
            const firstInWindow = new Date(2016, 6, 15, 12)
            render(<DayPicker value={firstInWindow} onValueChange={noop} />)
            await enterYearView(user, firstInWindow)
            focusActiveCell()

            await user.keyboard("{ArrowLeft}")

            expect(screen.getByText("2007 - 2015")).toBeInTheDocument()
            expect(screen.getByRole("gridcell", { name: "2015" })).toHaveFocus()
        })

        it("snaps focus to max year when ArrowRight would cross max", async () => {
            const user = userEvent.setup()
            const lastValidYear = new Date(2024, 6, 15, 12)
            render(
                <DayPicker
                    value={lastValidYear}
                    onValueChange={noop}
                    max={new Date(2024, 11, 31, 23, 59, 59)}
                />,
            )
            await enterYearView(user, lastValidYear)
            focusActiveCell()

            await user.keyboard("{ArrowRight}")

            expect(screen.getByRole("gridcell", { name: "2024" })).toHaveFocus()
        })
    })

    describe("min greater than max", () => {
        it("ignores both bounds when min is greater than max", () => {
            render(
                <DayPicker
                    value={new Date(2024, 6, 15, 12)}
                    onValueChange={noop}
                    min={new Date(2024, 7, 1)}
                    max={new Date(2024, 6, 1)}
                />,
            )

            expect(screen.getByRole("gridcell", { name: "15" })).toHaveAttribute(
                "aria-disabled",
                "false",
            )
            expect(
                screen.getByRole("button", {
                    name: t("DayPicker.PreviousMonth", undefined),
                }),
            ).not.toBeDisabled()
            expect(
                screen.getByRole("button", { name: t("DayPicker.NextMonth", undefined) }),
            ).not.toBeDisabled()
        })
    })

    describe("invalid date", () => {
        beforeEach(() => {
            vi.useFakeTimers({ toFake: ["Date"] })
            vi.setSystemTime(new Date(2024, 6, 15, 12))
        })
        afterEach(() => {
            vi.useRealTimers()
        })

        it("survives every navigation and selection trigger when value is an invalid date", async () => {
            const user = userEvent.setup()
            const handleChange = vi.fn<(value: Date) => void>()

            /**
             * @description Returns a promise resolving after next, prev, prev, next
             * @param previousLabel Accessible name of the prev button of the mounted view
             * @param nextLabel Accessible name of the next button of the mounted view
             * @remarks Nets back to the starting period of the mounted view
             */
            const navigateForthAndBack = async (
                previousLabel: string,
                nextLabel: string,
            ) => {
                await user.click(screen.getByRole("button", { name: nextLabel }))
                await user.click(screen.getByRole("button", { name: previousLabel }))
                await user.click(screen.getByRole("button", { name: previousLabel }))
                await user.click(screen.getByRole("button", { name: nextLabel }))
            }

            // Wide bounds keep prev/next enabled in every view so the handlers actually run
            render(
                <DayPicker
                    value={new Date("not-a-date")}
                    onValueChange={handleChange}
                    min={new Date(2000, 0, 1)}
                    max={new Date(2050, 11, 31)}
                />,
            )

            // Day view → month view
            await navigateForthAndBack(
                t("DayPicker.PreviousMonth", undefined),
                t("DayPicker.NextMonth", undefined),
            )
            await user.click(
                screen.getByRole("button", { name: `${monthFullLabel("july")} 2024` }),
            )

            // Month view → year view
            await navigateForthAndBack(
                t("DayPicker.PreviousYear", undefined),
                t("DayPicker.NextYear", undefined),
            )
            await user.click(screen.getByRole("button", { name: "2024" }))

            // Year view → back down to month view
            await navigateForthAndBack(
                t("DayPicker.PreviousYears", undefined),
                t("DayPicker.NextYears", undefined),
            )
            await user.click(screen.getByRole("gridcell", { name: "2024" }))

            // Month view → back down to day view
            await user.click(
                screen.getByRole("gridcell", { name: monthShortLabel("july") }),
            )

            // Day view → selecting an enabled day reports it despite the invalid value
            await user.click(screen.getByRole("gridcell", { name: "15" }))

            expect(handleChange).toHaveBeenLastCalledWith(new Date(2024, 6, 15))
        })
    })
})

describe("DayPicker field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <DayPicker value={new Date(2024, 6, 15, 12)} onValueChange={noop} />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.click(screen.getByRole("gridcell", { name: "20" }))
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <DayPicker
                    value={new Date(2024, 6, 15, 12)}
                    onValueChange={noop}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.click(screen.getByRole("gridcell", { name: "20" }))

        expect(queryFieldError()).toBeInTheDocument()
    })
})
