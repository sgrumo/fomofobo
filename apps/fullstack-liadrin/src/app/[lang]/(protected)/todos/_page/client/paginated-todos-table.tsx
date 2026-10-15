"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { FallbackBox } from "ui-components/fallback-box"
import { Pagination } from "ui-components/pagination"
import { Spinner } from "ui-components/spinner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "ui-components/table"

import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { routes } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { todosPageSize } from "@/lib/todos/pagination"

type PaginatedTodosTableProps = RouteClientComponentProps<"todos">

export const PaginatedTodosTable = (props: PaginatedTodosTableProps) => {
    const { t } = useTranslation("shared")
    const { query, setQuery } = useDynamicRoute(routes[props.route])

    const {
        data: paginatedTodos,
        isLoading: paginatedLoading,
        isError: paginatedError,
    } = useQuery(
        api.listPaginatedTodosQuery({
            params: {},
            query: { page: query.page, pageSize: todosPageSize, completed: undefined },
        }),
    )

    return (
        <>
            {paginatedLoading && <Spinner title={t("Todos.Loading")} />}
            {paginatedError && <Alert type="error" text={t("Todos.Error")} />}
            {paginatedTodos !== undefined && (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[70%]">
                                    {t("Todos.ColumnTitle")}
                                </TableHead>
                                <TableHead className="w-[30%]">
                                    {t("Todos.ColumnStatus")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody
                            showEmptyFallback={paginatedTodos.items.length === 0}
                            emptyFallback={
                                <div className="py-12">
                                    <FallbackBox type="empty" title={t("Todos.Empty")} />
                                </div>
                            }
                        >
                            {paginatedTodos.items.map(todo => (
                                <TableRow key={todo.id}>
                                    <TableCell>{todo.title}</TableCell>
                                    <TableCell>
                                        {todo.completed
                                            ? t("Todos.StatusCompleted")
                                            : t("Todos.StatusPending")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Pagination
                        page={query.page}
                        totalPages={paginatedTodos.totalPages}
                        onPageChange={page => {
                            setQuery({ page })
                        }}
                        className="self-center"
                    />
                </>
            )}
        </>
    )
}
