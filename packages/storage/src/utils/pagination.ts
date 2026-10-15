import type { PaginationQuery } from "models"

/**
 * @description Maps a page query to the SQL `limit` and `offset`
 * @param query 1-based page and page size
 */
export const toLimitOffset = ({
    page,
    pageSize,
}: PaginationQuery): { limit: number; offset: number } => ({
    limit: pageSize,
    offset: (page - 1) * pageSize,
})
