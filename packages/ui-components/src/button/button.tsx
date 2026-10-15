import { Button as ButtonPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"
import type { StrictOmit } from "shared/types"
import { isDefined } from "shared/values"
import { match, P } from "ts-pattern"

import { Spinner } from "../spinner/spinner"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import { Tooltip } from "../tooltip/tooltip"
import type { ButtonIconPosition } from "./button.helper"
import { buttonIconContainerStyles, buttonStyles } from "./button.styles"

type ButtonProps = StrictOmit<
    ComponentProps<typeof ButtonPrimitive>,
    "children" | "disabled" | "nativeButton" | "focusableWhenDisabled"
> &
    (
        | {
              variant: "primary"
              size: "sm" | "md"
              destructive?: boolean
              children?: ReactNode
          }
        | {
              variant: "primary"
              size: "icon"
              destructive?: boolean
              children?: never
          }
        | {
              variant: "secondary" | "tertiary"
              size: "sm" | "md"
              destructive?: false
              children?: ReactNode
          }
        | {
              variant: "secondary" | "tertiary"
              size: "icon"
              destructive?: false
              children?: never
          }
    ) & {
        icon?: ReactNode
        iconPosition?: ButtonIconPosition
        disabled?: boolean | { value: true; tooltip: ReactNode }
        loading?: boolean
    }

export const Button = ({
    variant,
    size,
    destructive = false,
    icon,
    iconPosition = "start",
    className,
    children,
    disabled: propDisabled = false,
    loading = false,
    ...props
}: ButtonProps) => {
    const tooltipContent = match(propDisabled)
        .with(P.boolean, () => null)
        .with({ value: true }, ({ tooltip }) => tooltip)
        .exhaustive()

    const tooltipActive = match(propDisabled)
        .with(P.union(P.boolean, { value: true, tooltip: P.nullish }), () => false)
        .with({ value: true, tooltip: P.nonNullable }, () => true)
        .exhaustive()

    const disabled = match({ propDisabled, loading })
        .with(P.union({ loading: true }, { propDisabled: { value: true } }), () => true)
        .with(
            { propDisabled: P.boolean },
            ({ propDisabled: booleanPropDisabled }) => booleanPropDisabled,
        )
        .exhaustive()

    const spinnerPosition = match({ loading, icon, iconPosition })
        .returnType<ButtonIconPosition | null>()
        .with({ loading: false }, () => null)
        .with({ icon: P.nonNullable, iconPosition: "start" }, () => "start")
        .with(
            P.union({ icon: P.nonNullable, iconPosition: "end" }, { icon: P.nullish }),
            () => "end",
        )
        .exhaustive()

    const spinner = isDefined(spinnerPosition) ? (
        <div className={buttonIconContainerStyles({ size })}>
            <Spinner size="custom" theme="custom" />
        </div>
    ) : null

    return (
        <Tooltip
            active={tooltipActive}
            content={tooltipContent}
            trigger={{
                render: triggerProps => <div {...triggerProps} />,
            }}
        >
            <ButtonPrimitive
                className={state =>
                    cn(
                        buttonStyles({
                            variant,
                            size,
                            destructive,
                        }),
                        normalizeBaseUiStyling(className, state),
                    )
                }
                disabled={disabled}
                focusableWhenDisabled={true}
                {...props}
            >
                {spinnerPosition === "start" && spinner}
                {!spinner && !!icon && iconPosition === "start" && (
                    <div className={buttonIconContainerStyles({ size })}>{icon}</div>
                )}
                <div>{children}</div>
                {!spinner && !!icon && iconPosition === "end" && (
                    <div className={buttonIconContainerStyles({ size })}>{icon}</div>
                )}
                {spinnerPosition === "end" && spinner}
            </ButtonPrimitive>
        </Tooltip>
    )
}
