import "server-only"
import type { PaginationQuery } from "models"

export interface Page<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

/**
 * @description Builds the page response of a storage page and its query
 * @template T Item type
 * @param result Items of the page and total of the rows
 * @param query Page and page size asked
 */
export const toPage = <T>(
    result: { items: T[]; total: number },
    query: PaginationQuery,
): Page<T> => ({
    ...result,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(result.total / query.pageSize),
})
