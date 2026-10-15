"use client"

import { cn } from "frontend-shared/styles"
import type { Todo } from "models"
import { useTranslation } from "react-i18next"
import { Button } from "ui-components/button"

import { UpdateTodoDialog } from "@/components/client/update-todo-dialog/update-todo-dialog"
import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface TodoItemProps extends RouteClientComponentProps<"todos"> {
    todo: Todo
}

export const TodoItem = (props: TodoItemProps) => {
    const { t } = useTranslation("shared")

    return (
        <li className="flex items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <span
                className={cn("tp-b1-regular flex-1", {
                    "text-neutral-400 line-through dark:text-neutral-500":
                        props.todo.completed,
                })}
            >
                {props.todo.title}
            </span>
            <span className="tp-b2-regular shrink-0 text-neutral-500 dark:text-neutral-400">
                {props.todo.completed
                    ? t("Todos.StatusCompleted")
                    : t("Todos.StatusPending")}
            </span>
            <UpdateTodoDialog
                todo={props.todo}
                trigger={
                    <Button
                        variant="tertiary"
                        size="sm"
                        type="button"
                        className="shrink-0"
                    >
                        {t("Todos.Edit")}
                    </Button>
                }
            />
        </li>
    )
}
