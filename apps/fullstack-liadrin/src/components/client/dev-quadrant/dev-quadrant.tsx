"use client"

import { useQueryClient } from "@tanstack/react-query"
import { identity } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useTranslation } from "react-i18next"
import { Button } from "ui-components/button"
import { Field } from "ui-components/field"
import { IconChevronRight, IconHorizontalLine } from "ui-components/icons"
import { NumberInput } from "ui-components/number-input"
import { Select } from "ui-components/select"

import { LanguageSwitcher } from "@/components/client/language-switcher/language-switcher"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { localStorageSchema } from "@/lib/storage/local-storage"
import type { LocalStorageItem } from "@/lib/storage/local-storage"

type DevQuadrantPosition = LocalStorageItem<"dev-quadrant">["position"]

const positionContainerClasses: Record<DevQuadrantPosition, string> = {
    "top-left": "top-2 left-2 items-start",
    "top-right": "top-2 right-2 items-end",
    "bottom-left": "bottom-2 left-2 items-start",
    "bottom-right": "bottom-2 right-2 items-end",
}

const positionArrowClasses: Record<DevQuadrantPosition, string> = {
    "top-left": "-rotate-[135deg]",
    "top-right": "-rotate-45",
    "bottom-right": "rotate-45",
    "bottom-left": "rotate-[135deg]",
}

const positionLabels: Record<DevQuadrantPosition, string> = {
    "top-left": "Move to top left",
    "top-right": "Move to top right",
    "bottom-left": "Move to bottom left",
    "bottom-right": "Move to bottom right",
}

type Theme = LocalStorageItem<"theme">
const themeItems: Theme[] = ["light", "dark", "system"]

export const DevQuadrant = () => {
    const [devQuadrant, setDevQuadrant] = useLocalStorage("dev-quadrant")
    const { position, minimized } = devQuadrant

    return (
        <div
            className={cn(
                "fixed z-[1000] flex flex-col",
                positionContainerClasses[position],
            )}
        >
            {minimized ? (
                <button
                    type="button"
                    aria-label="Open dev panel"
                    onClick={() => {
                        setDevQuadrant({ ...devQuadrant, minimized: false })
                    }}
                    className="tp-c1-semibold rounded-md border border-neutral-200 bg-white px-3 py-1 text-neutral-700 shadow-md hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                    DEV
                </button>
            ) : (
                <div className="flex w-80 flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="flex items-center justify-between">
                        <span className="tp-b2-semibold text-neutral-900 dark:text-neutral-100">
                            DEV
                        </span>
                        <div className="flex items-center gap-1">
                            {localStorageSchema[
                                "dev-quadrant"
                            ].shape.position.options.map(pos => (
                                <button
                                    key={pos}
                                    type="button"
                                    aria-label={positionLabels[pos]}
                                    aria-pressed={pos === position}
                                    onClick={() => {
                                        setDevQuadrant({ ...devQuadrant, position: pos })
                                    }}
                                    className={cn(
                                        "rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200",
                                        {
                                            "text-neutral-900 dark:text-neutral-100":
                                                pos === position,
                                        },
                                    )}
                                >
                                    <IconChevronRight
                                        className={cn(
                                            "size-4",
                                            positionArrowClasses[pos],
                                        )}
                                    />
                                </button>
                            ))}
                            <button
                                type="button"
                                aria-label="Minimize dev panel"
                                onClick={() => {
                                    setDevQuadrant({ ...devQuadrant, minimized: true })
                                }}
                                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                            >
                                <IconHorizontalLine className="size-4" />
                            </button>
                        </div>
                    </div>
                    <DevThemeSelect />
                    <Field label="Language" required={false}>
                        <LanguageSwitcher />
                    </Field>
                    <DevApiDelay />
                    <DevQueryActions />
                </div>
            )}
        </div>
    )
}

const DevThemeSelect = () => {
    const { t } = useTranslation("shared")
    const [theme, setTheme] = useLocalStorage("theme")

    return (
        <Field label="Theme" required={false}>
            <Select
                multiple={false}
                resettable={false}
                items={themeItems}
                value={theme}
                onValueChange={next => {
                    if (next !== undefined) {
                        setTheme(next)
                    }
                }}
                getItemId={identity}
                renderItem={({ item }) => t(`Theme.${item}`)}
            />
        </Field>
    )
}

const DevApiDelay = () => {
    const [stored, setStored] = useLocalStorage("api-delay")

    return (
        <div className="flex flex-col gap-2">
            <span className="tp-b2-semibold text-neutral-500 dark:text-neutral-400">
                Client API delay
            </span>
            <Field label="Base (ms)" required={false}>
                <NumberInput
                    size="md"
                    min={0}
                    value={stored.base}
                    onValueChange={next => {
                        setStored({ ...stored, base: next ?? 0 })
                    }}
                />
            </Field>
            <Field label="Jitter (ms)" required={false}>
                <NumberInput
                    size="md"
                    min={0}
                    value={stored.jitter}
                    onValueChange={next => {
                        setStored({ ...stored, jitter: next ?? 0 })
                    }}
                />
            </Field>
        </div>
    )
}

const DevQueryActions = () => {
    const queryClient = useQueryClient()

    return (
        <div className="flex flex-col gap-2">
            <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                    void queryClient.invalidateQueries()
                }}
            >
                Invalidate all queries
            </Button>
            <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                    void queryClient.resetQueries()
                }}
            >
                Reset all queries
            </Button>
        </div>
    )
}
