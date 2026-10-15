import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { describe, expect, it, vi } from "vitest"

import { render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import { Pagination } from "./pagination"

const goToPage = (page: number) => t("Pagination.GoToPage", { page })
const previousPage = () => t("Pagination.PreviousPage", undefined)
const nextPage = () => t("Pagination.NextPage", undefined)

/**
 * @description Returns the count of page buttons and ellipsis cells on screen
 */
const cellCount = () =>
    screen.getAllByRole("button").length + screen.queryAllByText("…").length

describe("Pagination", () => {
    it("renders nothing when there is a single page", () => {
        render(<Pagination page={1} totalPages={1} onPageChange={noop} />)

        expect(
            screen.queryByRole("button", { name: previousPage() }),
        ).not.toBeInTheDocument()
    })

    it("renders a button for every page when pages are few", () => {
        render(<Pagination page={1} totalPages={3} onPageChange={noop} />)

        expect(screen.getByRole("button", { name: goToPage(1) })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: goToPage(2) })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: goToPage(3) })).toBeInTheDocument()
        expect(screen.queryByText("…")).not.toBeInTheDocument()
    })

    it("renders previous and next controls", () => {
        render(<Pagination page={1} totalPages={3} onPageChange={noop} />)

        expect(screen.getByRole("button", { name: previousPage() })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: nextPage() })).toBeInTheDocument()
    })

    it("marks the current page with aria-current", () => {
        render(<Pagination page={2} totalPages={3} onPageChange={noop} />)

        expect(screen.getByRole("button", { name: goToPage(2) })).toHaveAttribute(
            "aria-current",
            "page",
        )
        expect(screen.getByRole("button", { name: goToPage(1) })).not.toHaveAttribute(
            "aria-current",
        )
    })

    it.each([
        { page: -5, selected: 1 },
        { page: 0, selected: 1 },
        { page: 100, selected: 5 },
        { page: Number.NaN, selected: 1 },
        { page: -Infinity, selected: 1 },
        { page: Infinity, selected: 5 },
        { page: 2.7, selected: 2 },
    ])(
        "selects the clamped page $selected for the weird page value $page without throwing",
        ({ page, selected }) => {
            expect(() =>
                render(<Pagination page={page} totalPages={5} onPageChange={noop} />),
            ).not.toThrow()

            expect(
                screen.getByRole("button", { name: goToPage(selected) }),
            ).toHaveAttribute("aria-current", "page")
        },
    )

    it.each([
        { page: Number.NaN, direction: "next", label: nextPage, expected: 2 },
        { page: -Infinity, direction: "next", label: nextPage, expected: 2 },
        { page: Infinity, direction: "previous", label: previousPage, expected: 4 },
        { page: 2.7, direction: "next", label: nextPage, expected: 3 },
        { page: 2.7, direction: "previous", label: previousPage, expected: 1 },
    ])(
        "steps to $expected from the clamped page (not the raw $page) when paging $direction",
        async ({ page, label, expected }) => {
            const user = userEvent.setup()
            const onPageChange = vi.fn<(page: number) => void>()

            render(<Pagination page={page} totalPages={5} onPageChange={onPageChange} />)

            await user.click(screen.getByRole("button", { name: label() }))

            expect(onPageChange).toHaveBeenCalledWith(expected)
        },
    )

    it("calls onPageChange with the clicked page", async () => {
        const user = userEvent.setup()
        const onPageChange = vi.fn<(page: number) => void>()

        render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />)

        await user.click(screen.getByRole("button", { name: goToPage(4) }))

        expect(onPageChange).toHaveBeenCalledWith(4)
    })

    it("steps with the previous and next buttons", async () => {
        const user = userEvent.setup()
        const onPageChange = vi.fn<(page: number) => void>()

        render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />)

        await user.click(screen.getByRole("button", { name: nextPage() }))
        await user.click(screen.getByRole("button", { name: previousPage() }))

        expect(onPageChange).toHaveBeenNthCalledWith(1, 4)
        expect(onPageChange).toHaveBeenNthCalledWith(2, 2)
    })

    it("disables previous on the first page and next on the last page", () => {
        const { rerender } = render(
            <Pagination page={1} totalPages={5} onPageChange={noop} />,
        )

        expect(screen.getByRole("button", { name: previousPage() })).toBeDisabled()
        expect(screen.getByRole("button", { name: nextPage() })).toBeEnabled()

        rerender(<Pagination page={5} totalPages={5} onPageChange={noop} />)

        expect(screen.getByRole("button", { name: previousPage() })).toBeEnabled()
        expect(screen.getByRole("button", { name: nextPage() })).toBeDisabled()
    })

    it("disables every control when disabled", () => {
        render(<Pagination page={2} totalPages={5} onPageChange={noop} disabled={true} />)

        expect(screen.getByRole("button", { name: previousPage() })).toBeDisabled()
        expect(screen.getByRole("button", { name: nextPage() })).toBeDisabled()
        expect(screen.getByRole("button", { name: goToPage(1) })).toBeDisabled()
    })

    it("collapses far pages behind an ellipsis on either side of the window", () => {
        render(<Pagination page={10} totalPages={20} onPageChange={noop} />)

        expect(screen.getAllByText("…")).toHaveLength(2)
        expect(screen.getByRole("button", { name: goToPage(1) })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: goToPage(20) })).toBeInTheDocument()
        expect(
            screen.queryByRole("button", { name: goToPage(5) }),
        ).not.toBeInTheDocument()
    })

    it("shows a single sibling on each side of the current page by default", () => {
        render(<Pagination page={10} totalPages={20} onPageChange={noop} />)

        expect(screen.getByRole("button", { name: goToPage(9) })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: goToPage(11) })).toBeInTheDocument()
        expect(
            screen.queryByRole("button", { name: goToPage(8) }),
        ).not.toBeInTheDocument()
    })

    it("widens the page window with a larger siblingCount", () => {
        render(
            <Pagination page={10} totalPages={20} onPageChange={noop} siblingCount={2} />,
        )

        expect(screen.getByRole("button", { name: goToPage(8) })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: goToPage(12) })).toBeInTheDocument()
    })

    it.each([
        { siblingCount: 0 },
        { siblingCount: -3 },
        { siblingCount: Number.NaN },
        { siblingCount: Infinity },
        { siblingCount: -Infinity },
        { siblingCount: 0.5 },
    ])(
        "falls back to a single sibling when siblingCount is $siblingCount",
        ({ siblingCount }) => {
            render(
                <Pagination
                    page={10}
                    totalPages={20}
                    onPageChange={noop}
                    siblingCount={siblingCount}
                />,
            )

            expect(screen.getByRole("button", { name: goToPage(9) })).toBeInTheDocument()
            expect(
                screen.queryByRole("button", { name: goToPage(8) }),
            ).not.toBeInTheDocument()
        },
    )

    it("keeps a constant number of cells across pages so the layout never shifts", () => {
        const { rerender } = render(
            <Pagination page={1} totalPages={20} onPageChange={noop} />,
        )
        const initialCells = cellCount()

        rerender(<Pagination page={10} totalPages={20} onPageChange={noop} />)
        expect(cellCount()).toBe(initialCells)

        rerender(<Pagination page={20} totalPages={20} onPageChange={noop} />)
        expect(cellCount()).toBe(initialCells)
    })
})
