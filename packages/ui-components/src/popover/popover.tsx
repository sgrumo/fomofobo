import { Popover as PopoverPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"
import type { StrictExclude, StrictOmit } from "shared/types"

import { useUiContext } from "../i18n/ui-context"
import { IconXMark } from "../icons/icons"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { TypographyOpts } from "../styling/styling.helper"
import {
    popoverArrowStyles,
    popoverCloseIconStyles,
    popoverDescriptionStyles,
    popoverHeaderStyles,
    popoverPopupStyles,
    popoverTitleStyles,
} from "./popover.styles"

export const PopoverRoot = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverClose = PopoverPrimitive.Close

interface PopoverContentProps extends Pick<
    ComponentProps<typeof PopoverPrimitive.Popup>,
    "className"
> {
    children?: ReactNode
    showArrow?: boolean
    positionerProps?: StrictOmit<
        ComponentProps<typeof PopoverPrimitive.Positioner>,
        "side"
    > & {
        side?: StrictExclude<
            PopoverPrimitive.Positioner.Props["side"],
            "inline-start" | "inline-end"
        >
    }
}
export const PopoverContent = ({
    className: propClassName,
    children,
    showArrow,
    positionerProps: { sideOffset: positionerSideOffset = 8, ...positionerProps } = {},
}: PopoverContentProps) => (
    <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
            sideOffset={positionerSideOffset}
            {...positionerProps}
        >
            <PopoverPrimitive.Popup
                className={state =>
                    cn(popoverPopupStyles(), normalizeBaseUiStyling(propClassName, state))
                }
            >
                {showArrow && (
                    <PopoverPrimitive.Arrow className={popoverArrowStyles()}>
                        <IconTriangle />
                    </PopoverPrimitive.Arrow>
                )}
                {children}
            </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
)

interface PopoverTitleProps
    extends TypographyOpts, ComponentProps<typeof PopoverPrimitive.Title> {}
export const PopoverTitle = ({
    className: propClassName,
    typography,
    ...props
}: PopoverTitleProps) => (
    <PopoverPrimitive.Title
        className={state =>
            cn(
                popoverTitleStyles({ typography }),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

interface PopoverDescriptionProps
    extends TypographyOpts, ComponentProps<typeof PopoverPrimitive.Description> {}
export const PopoverDescription = ({
    className: propClassName,
    typography,
    ...props
}: PopoverDescriptionProps) => (
    <PopoverPrimitive.Description
        className={state =>
            cn(
                popoverDescriptionStyles({ typography }),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

interface PopoverHeaderProps {
    children?: ReactNode
    className?: string
}
export const PopoverHeader = (props: PopoverHeaderProps) => {
    const { i18n } = useUiContext()

    return (
        <div className={cn(popoverHeaderStyles(), props.className)}>
            {props.children}
            <PopoverPrimitive.Close
                className={popoverCloseIconStyles()}
                title={i18n.t("Shared.Close", undefined)}
            >
                <IconXMark />
            </PopoverPrimitive.Close>
        </div>
    )
}

const IconTriangle = (props: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 10" fill="none" {...props}>
        <path
            d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
            fill="currentColor"
        />
        <path
            d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
            fill="currentColor"
        />
        <path
            d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
            fill="currentColor"
        />
    </svg>
)
