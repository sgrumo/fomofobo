import { cn } from "frontend-shared/styles"
import type { AriaRole, ComponentProps, ReactNode } from "react"
import { isDefined } from "shared/values"
import { match, P } from "ts-pattern"

import {
    IconCheckCircle,
    IconInfo,
    IconWarningCircle,
    IconWarningTriangle,
} from "../icons/icons"
import { Spinner } from "../spinner/spinner"
import type { AlertType } from "./alert.helper"
import {
    alertContentStyles,
    alertIconStyles,
    alertIconWrapperStyles,
    alertLineStyles,
    alertRootStyles,
    alertTextListStyles,
    alertTextStyles,
} from "./alert.styles"

interface AlertItem {
    id: string
    value: ReactNode
}

interface AlertProps extends ComponentProps<"div"> {
    type: AlertType
    text: string | string[] | AlertItem[] | null
}

export const Alert = ({
    type,
    text,
    className: propClassName,
    children,
    ...props
}: AlertProps) => {
    const icon = match(type)
        .with("loading", () => <Spinner size="xs" className={alertIconStyles(type)} />)
        .with("info", () => <IconInfo className={alertIconStyles(type)} />)
        .with("success", () => <IconCheckCircle className={alertIconStyles(type)} />)
        .with("warning", () => <IconWarningTriangle className={alertIconStyles(type)} />)
        .with("error", () => <IconWarningCircle className={alertIconStyles(type)} />)
        .exhaustive()

    const role = match(type)
        .returnType<AriaRole | undefined>()
        .with(P.union("error", "warning"), () => "alert")
        .with(P.union("info", "success", "loading"), () => "status")
        .exhaustive()

    return (
        <div
            role={role}
            data-alert-type={type}
            className={cn(alertRootStyles(type), propClassName)}
            {...props}
        >
            <div className={alertContentStyles()}>
                <div className={alertIconWrapperStyles()}>{icon}</div>
                <div className={alertTextStyles(isDefined(text))}>
                    {text && !Array.isArray(text) && (
                        <AlertLine line={text} type={type} />
                    )}
                    {text && Array.isArray(text) && (
                        <div className={alertTextListStyles()}>
                            {text.map(item =>
                                typeof item === "string" ? (
                                    <AlertLine key={item} line={item} type={type} />
                                ) : (
                                    <AlertLine
                                        key={item.id}
                                        line={item.value}
                                        type={type}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
            {children}
        </div>
    )
}

interface AlertLineProps {
    line: ReactNode
    type: AlertType
}
const AlertLine = (props: AlertLineProps) => (
    <span className={alertLineStyles(props.type)}>{props.line}</span>
)
