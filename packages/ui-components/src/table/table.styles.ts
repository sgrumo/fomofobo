import { styles } from "frontend-shared/styles"

export const tableWrapperStyles = styles(() => "w-full")

export const tableStyles = styles(() => "w-full table-fixed caption-bottom")

interface TableHeaderStylesOpts {
    sticky: boolean
}
export const tableHeaderStyles = styles((opts: TableHeaderStylesOpts) => [
    {
        "[&>tr]:sticky [&>tr]:top-0 [&>tr]:z-10 [&>tr]:bg-white dark:[&>tr]:bg-neutral-900":
            opts.sticky,
    },
])

export const tableHeadStyles = styles(
    () =>
        "tp-b2-medium border-b border-neutral-200 p-3 text-left align-middle text-neutral-800 dark:border-neutral-700 dark:text-neutral-100",
)

interface TableCellStylesOpts {
    ellipsis: boolean
}
export const tableCellStyles = styles((opts: TableCellStylesOpts) => [
    "tp-b2-regular border-b border-neutral-200 p-3 align-middle text-neutral-600 dark:border-neutral-700 dark:text-neutral-300",
    {
        "max-w-none overflow-clip text-ellipsis whitespace-nowrap": opts.ellipsis,
    },
])
