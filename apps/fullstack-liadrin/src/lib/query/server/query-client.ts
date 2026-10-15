import "server-only"
import { QueryClient } from "@tanstack/react-query"

import { queryClientDefaultOptions } from "../query-client-options"

/**
 * @description Builds the query client of one server render
 * @remarks Builds a new client per request. A shared one would leak the data of one
 * visitor into the render of another
 */
export const buildServerQueryClient = (): QueryClient =>
    new QueryClient({ defaultOptions: queryClientDefaultOptions })
