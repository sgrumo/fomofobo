"use client"

import { useQuery } from "@tanstack/react-query"
import { identity } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useTranslation } from "react-i18next"
import { useDebounced } from "react-shared"
import { Alert } from "ui-components/alert"
import { FallbackBox } from "ui-components/fallback-box"
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

type TodosSearchResultsProps = RouteClientComponentProps<"todosSearch">

export const TodosSearchResults = (props: TodosSearchResultsProps) => {
    const { t } = useTranslation("shared")
    const { query } = useDynamicRoute(routes[props.route])
    const [debouncedText, debouncing] = useDebounced(query.text, identity)

    const {
        data: results,
        isFetching: resultsFetching,
        isError: resultsError,
    } = useQuery(
        api.searchTodosQuery({
            params: {},
            body: { text: debouncedText, completed: query.completed },
        }),
    )
    const loading = debouncing || resultsFetching

    return (
        <>
            {resultsError && <Alert type="error" text={t("TodosSearch.Error")} />}
            {results !== undefined && (
                <Table className={cn({ "opacity-50": loading })}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[70%]">
                                {t("TodosSearch.ColumnTitle")}
                            </TableHead>
                            <TableHead className="w-[30%]">
                                {t("TodosSearch.ColumnStatus")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        showEmptyFallback={results.length === 0}
                        emptyFallback={
                            <div className="py-12">
                                <FallbackBox
                                    type="empty"
                                    title={t("TodosSearch.Empty")}
                                />
                            </div>
                        }
                    >
                        {results.map(todo => (
                            <TableRow key={todo.id}>
                                <TableCell>{todo.title}</TableCell>
                                <TableCell>
                                    {todo.completed
                                        ? t("TodosSearch.StatusCompleted")
                                        : t("TodosSearch.StatusPending")}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            {loading && (
                <Spinner
                    size="xs"
                    title={t("TodosSearch.Loading")}
                    className="self-center"
                />
            )}
        </>
    )
}
