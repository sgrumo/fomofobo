"use client"

import { languageKeys } from "i18n/i18n"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"

import { SettingToggleRenderItem } from "@/components/client/setting-toggle-render-item/setting-toggle-render-item"
import { replaceLanguage } from "@/lib/i18n/language-path"

export const LanguageSwitcher = () => {
    const { t } = useTranslation("shared")

    return (
        <nav
            aria-label={t("Language.Label")}
            className="flex w-fit items-center gap-1 rounded-md border border-neutral-200 p-1 dark:border-neutral-700"
        >
            <Suspense fallback={<LanguageLinks search="" />}>
                <LanguageLinksWithSearch />
            </Suspense>
        </nav>
    )
}

const LanguageLinksWithSearch = () => {
    const searchParams = useSearchParams()
    const search = searchParams.size === 0 ? "" : `?${searchParams.toString()}`

    return <LanguageLinks search={search} />
}

interface LanguageLinksProps {
    search: string
}

const LanguageLinks = (props: LanguageLinksProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const pathname = usePathname()

    return languageKeys.map(item => (
        <Link
            key={item}
            href={`${replaceLanguage(pathname, item)}${props.search}`}
            hrefLang={item}
            aria-label={t(`Language.${item}`)}
            aria-current={item === language ? "true" : undefined}
            replace={true}
            scroll={false}
            prefetch={false}
            className="focus-visible:outline-primary-500 rounded focus-visible:outline-2 focus-visible:outline-offset-1"
        >
            <SettingToggleRenderItem toggledBy="state" toggled={item === language}>
                {item.toUpperCase()}
            </SettingToggleRenderItem>
        </Link>
    ))
}
