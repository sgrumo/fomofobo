import { HydrationBoundary } from "@tanstack/react-query"
import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { serverApi } from "@/lib/api/server/api"
import { prefetchQueries } from "@/lib/query/server/prefetch"
import { todosPageSize } from "@/lib/todos/pagination"
import { requireSession } from "@/server/auth/require-session"

import { TodosFrame } from "./_page/server/todos-frame"

const route = routes.todos

// The prefetch below reads the database, which no build stage can reach.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/[lang]/todos">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = async (props: PageProps<"/[lang]/todos">) => {
    const { parameters, path, query } = await getDynamicRoute(route, props)
    await requireSession(path)

    const dehydratedState = await prefetchQueries(queryClient =>
        Promise.allSettled([
            queryClient.query(serverApi.listTodosQuery({ params: {}, query: {} })),
            queryClient.query(
                serverApi.listPaginatedTodosQuery({
                    params: {},
                    query: {
                        page: query.page,
                        pageSize: todosPageSize,
                        completed: undefined,
                    },
                }),
            ),
        ]),
    )

    return (
        <HydrationBoundary state={dehydratedState}>
            <TodosFrame language={parameters.lang} />
        </HydrationBoundary>
    )
}

export default Page
