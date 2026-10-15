import { noop } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"
import { useState } from "react"
import { combineRefs } from "react-shared"
import type { StrictOmit } from "shared/types"

import { FallbackBox } from "../fallback-box/fallback-box"
import { useUiContext } from "../i18n/ui-context"
import { TableContext, useTableContext } from "./table.context"
import {
    tableCellStyles,
    tableHeadStyles,
    tableHeaderStyles,
    tableStyles,
    tableWrapperStyles,
} from "./table.styles"

export const Table = ({
    className,
    tableClassName,
    children,
    ...props
}: ComponentProps<"div"> & { tableClassName?: string }) => {
    const [columns, setColumns] = useState<number | null>(null)

    return (
        <TableContext value={{ columns, setColumns }}>
            <div className={cn(tableWrapperStyles(), className)} {...props}>
                <table className={cn(tableStyles(), tableClassName)}>{children}</table>
            </div>
        </TableContext>
    )
}

interface TableHeaderProps extends ComponentProps<"thead"> {
    sticky?: boolean
}
export const TableHeader = ({
    ref: propRef,
    className: propClassName,
    sticky = true,
    ...props
}: TableHeaderProps) => {
    const context = useTableContext()

    const columnsSetterRef = (element: HTMLTableSectionElement | null) => {
        if (!element || !context) {
            return noop
        }

        const countColumns = () => {
            const count = element.querySelectorAll("th").length
            if (count !== context.columns) {
                context.setColumns(count)
            }
        }

        const observer = new MutationObserver(countColumns)
        observer.observe(element, { childList: true, subtree: true })
        countColumns()

        return () => {
            observer.disconnect()
        }
    }

    return (
        <thead
            {...props}
            className={cn(tableHeaderStyles({ sticky }), propClassName)}
            ref={combineRefs(propRef, columnsSetterRef)}
        />
    )
}

interface TableBodyProps extends StrictOmit<ComponentProps<"tbody">, "children"> {
    showEmptyFallback: boolean
    emptyFallback?: ReactNode
    children?: ReactNode
}
export const TableBody = ({
    children,
    showEmptyFallback,
    emptyFallback,
    className: propClassName,
    ...props
}: TableBodyProps) => {
    const context = useTableContext()
    const { isDev } = useUiContext()

    if (!showEmptyFallback) {
        return (
            <tbody {...props} className={propClassName}>
                {children}
            </tbody>
        )
    }

    return (
        <tbody
            {...props}
            className={cn(
                '[&>tr[data-empty-fallback-row="true"]:has(+_tr)]:hidden',
                propClassName,
            )}
        >
            <tr data-empty-fallback-row={!isDev}>
                <td colSpan={context?.columns ?? 100}>
                    {emptyFallback ?? (
                        <div className="py-12">
                            <FallbackBox type="empty" />
                        </div>
                    )}
                </td>
            </tr>
            {children}
        </tbody>
    )
}

export const TableRow = ({ ...props }: ComponentProps<"tr">) => <tr {...props} />

export const TableHead = ({ className, ...props }: ComponentProps<"th">) => (
    <th className={cn(tableHeadStyles(), className)} {...props} />
)

interface TableCellProps extends ComponentProps<"td"> {
    ellipsis?: boolean
}
export const TableCell = ({ className, ellipsis = true, ...props }: TableCellProps) => (
    <td className={cn(tableCellStyles({ ellipsis }), className)} {...props} />
)
