"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { Button } from "ui-components/button"
import { FallbackBox } from "ui-components/fallback-box"
import { Spinner } from "ui-components/spinner"

import { CreateTodoDialog } from "@/components/client/create-todo-dialog/create-todo-dialog"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"

import { TodoItem } from "./todo-item"

type TodosListProps = RouteClientComponentProps<"todos">

export const TodosList = (props: TodosListProps) => {
    const { t } = useTranslation("shared")

    const {
        data: todos,
        isLoading: todosLoading,
        isError: todosError,
    } = useQuery(api.listTodosQuery({ params: {}, query: {} }))

    return (
        <>
            <CreateTodoDialog
                trigger={
                    <Button
                        variant="primary"
                        size="md"
                        type="button"
                        className="self-start"
                    >
                        {t("Todos.Create.Trigger")}
                    </Button>
                }
            />
            {todosLoading && <Spinner title={t("Todos.Loading")} />}
            {todosError && <Alert type="error" text={t("Todos.Error")} />}
            {todos !== undefined && todos.length === 0 && (
                <FallbackBox type="empty" title={t("Todos.Empty")} />
            )}
            {todos !== undefined && todos.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {todos.map(todo => (
                        <TodoItem key={todo.id} route={props.route} todo={todo} />
                    ))}
                </ul>
            )}
        </>
    )
}
