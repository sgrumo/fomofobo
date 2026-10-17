"use client"

import { identity } from "es-toolkit"
import type { ReactNode } from "react"
import { useEffect, useEffectEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDebounced } from "react-shared"
import { Alert } from "ui-components/alert"
import { Pagination } from "ui-components/pagination"
import { SearchField } from "ui-components/search-field"
import { Spinner } from "ui-components/spinner"

const SEARCH_DEBOUNCE_MS = 300

interface BackofficeListProps {
    title: string
    search?: {
        label: string
        value: string | undefined
        onValueChange: (value: string | undefined) => void
    }
    filters?: ReactNode
    actions?: ReactNode
    status: "pending" | "error" | "success"
    page: number
    totalPages: number
    onPageChange: (page: number) => void
    children?: ReactNode
}

export const BackofficeList = (props: BackofficeListProps) => {
    const { t } = useTranslation("shared")
    const { search } = props

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="tp-pixel-xl">{props.title}</h1>
                {props.actions}
            </div>
            {(search !== undefined || props.filters !== undefined) && (
                <div className="flex flex-wrap items-end gap-2">
                    {search !== undefined && (
                        <ListSearch
                            label={search.label}
                            value={search.value}
                            onValueChange={value => {
                                search.onValueChange(value)
                            }}
                        />
                    )}
                    {props.filters}
                </div>
            )}
            {props.status === "pending" && (
                <Spinner title={t("Backoffice.List.Loading")} />
            )}
            {props.status === "error" && (
                <Alert type="error" text={t("Backoffice.List.Error")} />
            )}
            {props.status === "success" && props.children}
            <Pagination
                page={props.page}
                totalPages={props.totalPages}
                onPageChange={props.onPageChange}
            />
        </section>
    )
}

interface ListSearchProps {
    label: string
    value: string | undefined
    onValueChange: (value: string | undefined) => void
}

const ListSearch = (props: ListSearchProps) => {
    const [text, setText] = useState(props.value ?? "")
    const [debounced] = useDebounced(text, identity, SEARCH_DEBOUNCE_MS)

    const commit = useEffectEvent((value: string) => {
        const next = value.trim() === "" ? undefined : value.trim()
        if (next !== props.value) {
            props.onValueChange(next)
        }
    })
    useEffect(() => {
        commit(debounced)
    }, [debounced])

    return (
        <SearchField
            label={props.label}
            placeholder={props.label}
            value={text}
            onValueChange={setText}
            className="max-w-sm grow"
        />
    )
}
