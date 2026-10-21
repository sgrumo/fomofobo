"use client"

import { useQueryClient } from "@tanstack/react-query"
import { cn } from "frontend-shared/styles"
import { Button } from "ui-components/button"
import { Field } from "ui-components/field"
import { IconChevronRight, IconHorizontalLine } from "ui-components/icons"
import { NumberInput } from "ui-components/number-input"

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
                    className="tp-pixel-sm border-line-muted bg-surface text-fg shadow-hard-md hover:bg-surface-muted rounded-md border px-3 py-1"
                >
                    DEV
                </button>
            ) : (
                <div className="border-line-muted bg-surface shadow-hard-lg flex w-80 flex-col gap-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <span className="tp-pixel-md text-fg">DEV</span>
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
                                        "text-fg-subtle hover:bg-surface-muted hover:text-fg rounded p-1",
                                        {
                                            "text-fg": pos === position,
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
                                className="text-fg-subtle hover:bg-surface-muted hover:text-fg rounded p-1"
                            >
                                <IconHorizontalLine className="size-4" />
                            </button>
                        </div>
                    </div>
                    <DevApiDelay />
                    <DevQueryActions />
                </div>
            )}
        </div>
    )
}

const DevApiDelay = () => {
    const [stored, setStored] = useLocalStorage("api-delay")

    return (
        <div className="flex flex-col gap-2">
            <span className="tp-pixel-md text-fg-muted">Client API delay</span>
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
