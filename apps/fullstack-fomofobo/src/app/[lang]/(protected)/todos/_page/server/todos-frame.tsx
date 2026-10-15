import "server-only"
import type { LanguageKey } from "i18n/i18n"

import { getTranslation } from "@/lib/i18n/server/translation"

import { PaginatedTodosTable } from "../client/paginated-todos-table"
import { TodosList } from "../client/todos-list"

interface TodosFrameProps {
    language: LanguageKey
}

export const TodosFrame = (props: TodosFrameProps) => {
    const t = getTranslation(props.language)

    return (
        <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-6 p-6">
            <h1 className="tp-h1">{t("Todos.Title")}</h1>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="flex flex-col gap-4">
                    <TodosList route="todos" />
                </section>
                <section className="flex flex-col gap-4">
                    <h2 className="tp-h3-semibold">{t("Todos.PaginatedTitle")}</h2>
                    <PaginatedTodosTable route="todos" />
                </section>
            </div>
        </div>
    )
}
