"use client"

import type { ReactNode } from "react"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { match } from "ts-pattern"
import { IconHome } from "ui-components/icons"

import { LanguageSwitcher } from "@/components/client/language-switcher/language-switcher"
import { SessionMenu } from "@/components/client/session-menu/session-menu"
import { ThemeSwitcher } from "@/components/client/theme-switcher/theme-switcher"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"

type BaseLayoutProps = {
    children?: ReactNode
} & (
    | {
          variant: "public"
      }
    | {
          variant: "protected"
          visitorName: string
      }
)

export const BaseLayout = (props: BaseLayoutProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()

    return (
        <main className="flex h-[100dvh] w-[100dvw] flex-col overflow-auto">
            <header className="sticky top-0 z-100 flex items-center justify-between gap-4 border-b border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900">
                <RouteLink
                    route={routes.root}
                    parameters={{ lang: language }}
                    query={{}}
                    aria-label={t("Routes.Home")}
                    className="flex items-center gap-2 rounded-md p-1 text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                    <IconHome className="size-5" />
                </RouteLink>
                <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                    {match(props)
                        .with({ variant: "public" }, () => undefined)
                        .with({ variant: "protected" }, protectedProps => (
                            <SessionMenu name={protectedProps.visitorName} />
                        ))
                        .exhaustive()}
                </div>
            </header>
            {props.children}
        </main>
    )
}
