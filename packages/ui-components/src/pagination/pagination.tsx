import { cn } from "frontend-shared/styles"

import { useUiContext } from "../i18n/ui-context"
import { IconChevronRight } from "../icons/icons"
import { getPaginationRange } from "./pagination.helper"
import type { PaginationSize } from "./pagination.helper"
import {
    paginationEllipsisStyles,
    paginationItemStyles,
    paginationNavStyles,
} from "./pagination.styles"

interface PaginationProps {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
    siblingCount?: number
    size?: PaginationSize
    disabled?: boolean
    className?: string
}

export const Pagination = (props: PaginationProps) => {
    const { i18n } = useUiContext()

    const disabled = props.disabled ?? false
    const size = props.size ?? "md"

    if (props.totalPages <= 1) {
        return null
    }

    const page = Number.isNaN(props.page)
        ? 1
        : Math.min(Math.max(Math.floor(props.page), 1), props.totalPages)
    const entries = getPaginationRange(page, props.totalPages, {
        siblingCount: props.siblingCount ?? 1,
    })

    return (
        <div
            aria-label={i18n.t("Pagination.Label", undefined)}
            className={cn("flex items-center gap-1", props.className)}
        >
            <button
                type="button"
                aria-label={i18n.t("Pagination.PreviousPage", undefined)}
                disabled={disabled || page <= 1}
                onClick={() => {
                    props.onPageChange(page - 1)
                }}
                className={paginationNavStyles({ size })}
            >
                <IconChevronRight className="rotate-180" />
            </button>
            {entries.map(entry =>
                entry.type === "ellipsis" ? (
                    <span
                        key={entry.key}
                        aria-hidden={true}
                        className={paginationEllipsisStyles({ size })}
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={entry.key}
                        type="button"
                        aria-label={i18n.t("Pagination.GoToPage", { page: entry.page })}
                        aria-current={entry.page === page ? "page" : undefined}
                        disabled={disabled}
                        onClick={() => {
                            props.onPageChange(entry.page)
                        }}
                        className={paginationItemStyles({
                            selected: entry.page === page,
                            size,
                        })}
                    >
                        {entry.page}
                    </button>
                ),
            )}
            <button
                type="button"
                aria-label={i18n.t("Pagination.NextPage", undefined)}
                disabled={disabled || page >= props.totalPages}
                onClick={() => {
                    props.onPageChange(page + 1)
                }}
                className={paginationNavStyles({ size })}
            >
                <IconChevronRight />
            </button>
        </div>
    )
}
