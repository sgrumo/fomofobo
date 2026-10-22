"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { SessionMenu } from "@/components/client/session-menu/session-menu"
import { routes } from "@/framework/routes/routes"

import type { BackofficeAccount } from "./backoffice-shell.context"
import { BackofficeAccountContext } from "./backoffice-shell.context"

interface BackofficeShellProps {
    account: BackofficeAccount
    children?: ReactNode
}

const NAVIGATION = [
    {
        href: routes.backofficeEvents.path({ parameters: {}, query: {} }),
        label: "Backoffice.Nav.Events",
        adminOnly: false,
    },
    {
        href: routes.backofficeVenues.path({ parameters: {}, query: {} }),
        label: "Backoffice.Nav.Venues",
        adminOnly: false,
    },
    {
        href: routes.backofficeCategories.path({ parameters: {}, query: {} }),
        label: "Backoffice.Nav.Categories",
        adminOnly: true,
    },
    {
        href: routes.backofficeOrganizers.path({ parameters: {}, query: {} }),
        label: "Backoffice.Nav.Organizers",
        adminOnly: true,
    },
    {
        href: routes.backofficeSettings.path({ parameters: {}, query: {} }),
        label: "Backoffice.Nav.Settings",
        adminOnly: true,
    },
] as const

export const BackofficeShell = (props: BackofficeShellProps) => {
    const { t } = useTranslation("shared")
    const pathname = usePathname()

    return (
        <div className="bg-surface text-fg flex min-h-dvh flex-col">
            <header className="border-line flex flex-wrap items-center justify-between gap-2 border-b-2 px-4 py-2">
                <span className="tp-pixel-md">{t("Backoffice.Brand")}</span>
                <nav
                    aria-label={t("Backoffice.Nav.Label")}
                    className="flex flex-wrap gap-1"
                >
                    {NAVIGATION.filter(
                        item => !item.adminOnly || props.account.role === "admin",
                    ).map(item => {
                        const current =
                            pathname === item.href || pathname.startsWith(`${item.href}/`)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={current ? "page" : undefined}
                                className="tp-pixel-sm hover:bg-surface-muted aria-[current=page]:bg-fg aria-[current=page]:text-surface px-2 py-1"
                            >
                                {t(item.label)}
                            </Link>
                        )
                    })}
                </nav>
                <SessionMenu name={props.account.name} />
            </header>
            <main className="flex grow flex-col gap-4 p-4">
                <BackofficeAccountContext value={props.account}>
                    {props.children}
                </BackofficeAccountContext>
            </main>
        </div>
    )
}
