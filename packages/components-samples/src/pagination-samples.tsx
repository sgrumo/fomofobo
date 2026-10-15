import { useState } from "react"
import { Pagination } from "ui-components/pagination"

export const PaginationSamples = () => {
    const [page, setPage] = useState(1)

    return (
        <div className="flex flex-col items-start gap-4">
            <Pagination
                page={page}
                totalPages={10}
                onPageChange={setPage}
                siblingCount={1}
            />
            <p>Current page: {page}</p>
        </div>
    )
}
