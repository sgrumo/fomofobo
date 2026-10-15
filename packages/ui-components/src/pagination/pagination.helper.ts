import { range } from "es-toolkit"
import { match } from "ts-pattern"

export type PaginationSize = "sm" | "md"

interface PaginationPageEntry {
    type: "page"
    page: number
    key: `page-${number}`
}
interface PaginationEllipsisEntry {
    type: "ellipsis"
    key: `ellipsis-start-${number}` | `ellipsis-end-${number}`
}
type PaginationEntry = PaginationPageEntry | PaginationEllipsisEntry

/**
 * @description Builds a page entry keyed by its cell position
 * @param page Page number shown
 * @param index Cell position holding the entry
 */
const pageEntry = (page: number, index: number): PaginationEntry => ({
    type: "page",
    page,
    key: `page-${index}`,
})
/**
 * @description Builds an ellipsis entry keyed by its side and cell position
 * @param side Edge the gap sits on
 * @param index Cell position holding the entry
 */
const ellipsisEntry = (side: "start" | "end", index: number): PaginationEntry => ({
    type: "ellipsis",
    key: `ellipsis-${side}-${index}`,
})

/**
 * @description Builds the page and ellipsis entries of the pagination control
 * @param currentPage Page marked as current
 * @param totalPages Page count
 * @param opts Sibling count per side, floored to at least `1`
 * @remarks Yields pages outside the page count for an out-of-range `currentPage`
 */
export const getPaginationRange = (
    currentPage: number,
    totalPages: number,
    opts: {
        siblingCount: number
    },
): PaginationEntry[] => {
    const siblingCount =
        Number.isFinite(opts.siblingCount) && opts.siblingCount >= 1
            ? Math.floor(opts.siblingCount)
            : 1
    const fixedCells = siblingCount * 2 + 5
    const edgeRun = fixedCells - 3

    if (totalPages <= fixedCells) {
        return range(1, totalPages + 1).map(pageEntry)
    }

    const needsLeftEllipsis = currentPage > siblingCount + 2
    const needsRightEllipsis = currentPage < totalPages - (siblingCount + 1)

    const middle = match({ needsLeftEllipsis, needsRightEllipsis })
        .returnType<PaginationEntry[]>()
        .with({ needsLeftEllipsis: true, needsRightEllipsis: true }, () => [
            ellipsisEntry("start", 1),
            ...range(currentPage - siblingCount, currentPage + siblingCount + 1).map(
                (page, index) => pageEntry(page, index + 2),
            ),
            ellipsisEntry("end", fixedCells - 2),
        ])
        .with({ needsLeftEllipsis: true, needsRightEllipsis: false }, () => [
            ellipsisEntry("start", 1),
            ...range(totalPages - edgeRun, totalPages).map((page, index) =>
                pageEntry(page, index + 2),
            ),
        ])
        .with({ needsLeftEllipsis: false }, () => [
            ...range(2, 2 + edgeRun).map((page, index) => pageEntry(page, index + 1)),
            ellipsisEntry("end", fixedCells - 2),
        ])
        .exhaustive()

    return [pageEntry(1, 0), ...middle, pageEntry(totalPages, fixedCells - 1)]
}
