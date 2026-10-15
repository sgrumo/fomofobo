import { identity } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import type { CSSProperties, ReactNode } from "react"
import { useId, useState } from "react"
import { isDefined } from "shared/values"
import { match, P } from "ts-pattern"

import type { FormMode } from "../form/form.context"
import { useFormContext } from "../form/form.context"
import { useUiContext } from "../i18n/ui-context"
import { IconInfo } from "../icons/icons"
import { Tooltip } from "../tooltip/tooltip"
import { FieldContext } from "./field.context"

interface FieldProps {
    label: ReactNode
    required: boolean
    labelSide?: "top" | "right" | "bottom" | "left"
    labelWeight?: "normal" | "medium" | "semibold"
    gap?: "xs" | "sm" | `${number}rem`
    description?: string
    disabled?: boolean
    errors?: string[]
    mode?: FormMode
    dimDisabled?: boolean
    srOnly?: boolean
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export const Field = (props: FieldProps) => {
    const [changedAt, setChangedAt] = useState<Date | null>(null)
    const [blurredAt, setBlurredAt] = useState<Date | null>(null)

    const { i18n } = useUiContext()
    const formContext = useFormContext()

    const inputId = useId()
    const labelId = useId()
    const descriptionId = useId()
    const errorId = useId()
    const required = props.required
    const disabled = props.disabled ?? false
    const mode = props.mode ?? formContext?.mode ?? "edit"
    const formSubmittedAt = formContext?.submittedAt ?? null
    const errors = props.errors ?? []

    const editing =
        isDefined(changedAt) &&
        isDefined(formSubmittedAt) &&
        changedAt > formSubmittedAt &&
        (!isDefined(blurredAt) || blurredAt < changedAt)
    const showError =
        mode === "edit" && errors.length > 0 && isDefined(formSubmittedAt) && !editing

    const describedByIds =
        [
            isDefined(props.description) ? descriptionId : undefined,
            showError ? errorId : undefined,
        ]
            .filter(isDefined)
            .join(" ") || undefined

    const context: FieldContext = {
        inputId,
        labelId,
        label: props.label,
        describedByIds,
        required,
        disabled,
        errors: showError ? errors : undefined,
        mode,
        formSubmittedAt,
        changedAt,
        setChangedAt,
        blurredAt,
        setBlurredAt,
    }

    const dimDisabled = props.dimDisabled ?? true
    const labelWeight = props.labelWeight ?? "normal"

    const gap = match(props.gap)
        .returnType<`${number}rem`>()
        .with(P.union(undefined, "xs"), () => "0.25rem")
        .with("sm", () => "0.5rem")
        .with(P.string, identity)
        .exhaustive()

    const stacking = match(props.labelSide)
        .returnType<"vertical" | "horizontal">()
        .with(P.union(undefined, "top", "bottom"), () => "vertical")
        .with(P.union("left", "right"), () => "horizontal")
        .exhaustive()

    const position = match(props.labelSide)
        .returnType<"start" | "end">()
        .with(P.union(undefined, "top", "left"), () => "start")
        .with(P.union("right", "bottom"), () => "end")
        .exhaustive()

    const labelClassName = cn("w-fit text-neutral-800 dark:text-neutral-100", {
        "sr-only": !!props.srOnly,
        "tp-b2-regular": labelWeight === "normal",
        "tp-b2-medium": labelWeight === "medium",
        "tp-b2-semibold": labelWeight === "semibold",
        "cursor-not-allowed": disabled && mode === "edit",
    })

    const label = (
        <div className="inline-flex items-center gap-1">
            <div className="inline-block">
                {mode === "edit" && (
                    <label id={labelId} htmlFor={inputId} className={labelClassName}>
                        {props.label}
                    </label>
                )}
                {mode === "view" && (
                    <span id={labelId} className={labelClassName}>
                        {props.label}
                    </span>
                )}
                {props.required && mode === "edit" && (
                    <span className="text-danger-600 dark:text-danger-400">*</span>
                )}
            </div>
            {isDefined(props.description) && (
                <span id={descriptionId} hidden={true}>
                    {props.description}
                </span>
            )}
            {isDefined(props.description) && !props.srOnly && (
                <Tooltip
                    active={true}
                    content={props.description}
                    position={{
                        sideOffset: 8,
                    }}
                    trigger={{
                        render: (
                            <button
                                type="button"
                                className="mt-1 cursor-default"
                                aria-label={i18n.t("Field.MoreInfo", undefined)}
                            />
                        ),
                    }}
                >
                    <IconInfo className="size-4 text-neutral-500 dark:text-neutral-400" />
                </Tooltip>
            )}
        </div>
    )

    return (
        <div className={cn("flex flex-col gap-1", props.className)} style={props.style}>
            <div
                className={cn("flex", {
                    "flex-col": stacking === "vertical",
                    "flex-row items-center": stacking === "horizontal",
                    "opacity-75": disabled && dimDisabled && mode === "edit",
                })}
                style={{ gap }}
            >
                {position === "start" && label}
                <FieldContext value={context}>{props.children}</FieldContext>
                {position === "end" && label}
            </div>
            {showError && (
                <ul
                    id={errorId}

                    className="tp-c1-regular text-danger-600 dark:text-danger-400 flex flex-col"
                >
                    {errors.map(error => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}
