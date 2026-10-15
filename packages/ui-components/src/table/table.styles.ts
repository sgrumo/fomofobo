import { styles } from "frontend-shared/styles"

export const tableWrapperStyles = styles(() => "w-full")

export const tableStyles = styles(() => "w-full table-fixed caption-bottom")

interface TableHeaderStylesOpts {
    sticky: boolean
}
export const tableHeaderStyles = styles((opts: TableHeaderStylesOpts) => [
    {
        "[&>tr]:bg-surface [&>tr]:sticky [&>tr]:top-0 [&>tr]:z-10": opts.sticky,
    },
])

export const tableHeadStyles = styles(
    () => "tp-pixel-md border-line-muted text-fg border-b p-3 text-left align-middle",
)

interface TableCellStylesOpts {
    ellipsis: boolean
}
export const tableCellStyles = styles((opts: TableCellStylesOpts) => [
    "tp-body-md border-line-muted text-fg-muted border-b p-3 align-middle",
    {
        "max-w-none overflow-clip text-ellipsis whitespace-nowrap": opts.ellipsis,
    },
])
