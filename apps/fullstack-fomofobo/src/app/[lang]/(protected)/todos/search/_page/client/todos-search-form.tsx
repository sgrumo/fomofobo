"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Checkbox } from "ui-components/checkbox"
import { StringInput } from "ui-components/string-input"

import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { routes } from "@/framework/routes/routes"

type TodosSearchFormProps = RouteClientComponentProps<"todosSearch">

export const TodosSearchForm = (props: TodosSearchFormProps) => {
    const { t } = useTranslation("shared")
    const { query, setQuery } = useDynamicRoute(routes[props.route])
    const [text, setText] = useState(query.text)

    const onTextChange = (value: string | undefined) => {
        setText(value)
        setQuery({ text: value })
    }

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <StringInput
                value={text}
                onValueChange={onTextChange}
                placeholder={t("TodosSearch.TextPlaceholder")}
                className="flex-1"
            />
            <label className="flex items-center gap-2">
                <Checkbox
                    value={query.completed === true}
                    onValueChange={checked => {
                        setQuery({ completed: checked ? true : undefined })
                    }}
                    aria-label={t("TodosSearch.CompletedOnly")}
                    className="shrink-0"
                />
                <span className="tp-b1-regular">{t("TodosSearch.CompletedOnly")}</span>
            </label>
        </div>
    )
}
