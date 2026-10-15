"use client"

import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { match } from "ts-pattern"
import { IconMonitor, IconMoon, IconSun } from "ui-components/icons"
import { ToggleGroup } from "ui-components/toggle"
import type { z } from "zod"

import { SettingToggleRenderItem } from "@/components/client/setting-toggle-render-item/setting-toggle-render-item"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { localStorageSchema } from "@/lib/storage/local-storage"

const themeSchema = localStorageSchema.theme
type Theme = z.output<typeof themeSchema>
const themeItems: Theme[] = ["light", "dark", "system"]
const themeIcons: Record<Theme, ReactNode> = {
    light: <IconSun />,
    dark: <IconMoon />,
    system: <IconMonitor />,
}

export const ThemeSwitcher = () => {
    const { t } = useTranslation("shared")
    const [theme, setTheme] = useLocalStorage("theme")

    return (
        <ToggleGroup
            multiple={false}
            itemSchema={themeSchema}
            items={themeItems}
            value={theme}
            onValueChange={next => {
                if (next !== undefined) {
                    setTheme(next)
                }
            }}
            getItemLabel={item => t(`Theme.${item}`)}
            renderItem={({ item }) => (
                <SettingToggleRenderItem
                    toggledBy="document"
                    toggledClassName={match(item)
                        .with(
                            "light",
                            () =>
                                "[html:not(.dark):not(.system)_&]:bg-primary-500 [html:not(.dark):not(.system)_&]:text-white",
                        )
                        .with(
                            "dark",
                            () =>
                                "[html.dark_&]:bg-primary-500 dark:[html.dark_&]:bg-primary-300 [html.dark_&]:text-white",
                        )
                        .with(
                            "system",
                            () =>
                                "[html.system_&]:bg-primary-500 dark:[html.system_&]:bg-primary-300 [html.system_&]:text-white",
                        )
                        .exhaustive()}
                >
                    {themeIcons[item]}
                </SettingToggleRenderItem>
            )}
            className="flex items-center gap-1 rounded-md border border-neutral-200 p-1 dark:border-neutral-700"
        />
    )
}
