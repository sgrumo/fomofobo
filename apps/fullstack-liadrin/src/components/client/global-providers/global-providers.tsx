"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"
import type { ReactNode } from "react"
import { useDateFnsLocale } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { UiProvider } from "ui-components/provider"

import { createUiTranslate } from "@/lib/i18n/ui-wrapper"

import {
    getQueryClient,
    globalToastManager,
    globalToastTranslation,
} from "./global-providers-helper"

interface GlobalProvidersProps {
    children?: ReactNode
}

export const GlobalProviders = (props: GlobalProvidersProps) => {
    const { t } = useTranslation("ui")
    const locale = useDateFnsLocale()
    const uiTranslate = createUiTranslate(t)

    useEffect(() => {
        globalToastTranslation.t = uiTranslate
    }, [uiTranslate])

    return (
        <UiProvider
            i18n={{ t: uiTranslate, dateFns: { locale } }}
            isDev={process.env.NODE_ENV === "development"}
            toastManager={globalToastManager.base}
        >
            <QueryClientProvider client={getQueryClient()}>
                {props.children}
            </QueryClientProvider>
        </UiProvider>
    )
}
