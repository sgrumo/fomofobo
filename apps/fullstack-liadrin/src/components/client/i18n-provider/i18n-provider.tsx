"use client"

import type { LanguageKey } from "i18n/i18n"
import { applyZodLocale } from "i18n/i18n"
import type { ResourceLanguage } from "i18next"
import { useEffect } from "react"
import type { ReactNode } from "react"
import { I18nextProvider } from "react-i18next"

import { createI18nInstance } from "@/lib/i18n/instance"

interface I18nProviderProps {
    language: LanguageKey
    resources: ResourceLanguage
    children?: ReactNode
}

export const I18nProvider = (props: I18nProviderProps) => {
    const instance = createI18nInstance(props.language, props.resources)

    useEffect(() => {
        applyZodLocale(props.language)
    }, [props.language])

    return <I18nextProvider i18n={instance}>{props.children}</I18nextProvider>
}
