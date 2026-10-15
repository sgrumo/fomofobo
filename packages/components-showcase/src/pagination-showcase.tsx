import { cn } from "frontend-shared/styles"
import { useState } from "react"
import { Pagination } from "ui-components/pagination"
import type { PaginationSize } from "ui-components/pagination"

interface PaginationExampleShowcaseProps {
    totalPages: number
    size: PaginationSize
    initialPage?: number
    disabled?: boolean
}

const PaginationExampleShowcase = (props: PaginationExampleShowcaseProps) => {
    const [page, setPage] = useState(props.initialPage ?? 1)

    return (
        <div className="flex flex-col gap-1">
            <p className="tp-c1-medium text-neutral-500 uppercase">{props.size}</p>
            <Pagination
                page={page}
                totalPages={props.totalPages}
                onPageChange={setPage}
                disabled={props.disabled}
                siblingCount={1}
                size={props.size}
            />
        </div>
    )
}

interface PaginationSectionShowcaseProps {
    title: string
    totalPages: number
    initialPage?: number
    disabled?: boolean
}

const PaginationSectionShowcase = (props: PaginationSectionShowcaseProps) => (
    <div className="flex flex-col gap-3">
        <p className="tp-h4-semibold">{props.title}</p>
        <PaginationExampleShowcase
            size="md"
            totalPages={props.totalPages}
            initialPage={props.initialPage}
            disabled={props.disabled}
        />
        <PaginationExampleShowcase
            size="sm"
            totalPages={props.totalPages}
            initialPage={props.initialPage}
            disabled={props.disabled}
        />
    </div>
)

interface PaginationShowcaseProps {
    className?: string
}

export const PaginationShowcase = (props: PaginationShowcaseProps) => (
    <div className={cn("flex w-full flex-col gap-6", props.className)}>
        <PaginationSectionShowcase title="Few pages" totalPages={3} />
        <PaginationSectionShowcase title="Many pages" totalPages={20} initialPage={10} />
        <PaginationSectionShowcase title="Boundaries" totalPages={8} />
        <PaginationSectionShowcase
            title="Disabled"
            totalPages={8}
            initialPage={4}
            disabled={true}
        />
    </div>
)
