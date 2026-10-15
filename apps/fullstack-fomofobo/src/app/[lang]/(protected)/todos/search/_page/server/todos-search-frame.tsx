import "server-only"
import type { LanguageKey } from "i18n/i18n"

import { getTranslation } from "@/lib/i18n/server/translation"

import { TodosSearchForm } from "../client/todos-search-form"
import { TodosSearchResults } from "../client/todos-search-results"

interface TodosSearchFrameProps {
    language: LanguageKey
}

export const TodosSearchFrame = (props: TodosSearchFrameProps) => {
    const t = getTranslation(props.language)

    return (
        <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-6 p-6">
            <h1 className="tp-h1">{t("TodosSearch.Title")}</h1>
            <TodosSearchForm route="todosSearch" />
            <TodosSearchResults route="todosSearch" />
        </div>
    )
}
