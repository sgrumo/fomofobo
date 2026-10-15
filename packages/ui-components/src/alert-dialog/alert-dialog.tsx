import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"

import {
    dialogBackdropStyles,
    dialogBodyStyles,
    dialogCloseIconStyles,
    dialogDescriptionStyles,
    dialogPopupStyles,
    dialogHeaderStyles,
    dialogTitleStyles,
} from "../dialog/dialog.styles"
import { useUiContext } from "../i18n/ui-context"
import { IconXMark } from "../icons/icons"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { TypographyOpts } from "../styling/styling.helper"

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger
export const AlertDialogClose = AlertDialogPrimitive.Close

interface AlertDialogContentProps extends Pick<
    ComponentProps<typeof AlertDialogPrimitive.Popup>,
    "className"
> {
    children?: ReactNode
}
export const AlertDialogContent = (props: AlertDialogContentProps) => (
    <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Backdrop className={dialogBackdropStyles()} />
        <AlertDialogPrimitive.Viewport>
            <AlertDialogPrimitive.Popup
                className={state =>
                    cn(
                        dialogPopupStyles(),
                        normalizeBaseUiStyling(props.className, state),
                    )
                }
            >
                {props.children}
            </AlertDialogPrimitive.Popup>
        </AlertDialogPrimitive.Viewport>
    </AlertDialogPrimitive.Portal>
)

interface AlertDialogTitleProps
    extends TypographyOpts, ComponentProps<typeof AlertDialogPrimitive.Title> {}
export const AlertDialogTitle = ({
    className: propClassName,
    typography,
    ...props
}: AlertDialogTitleProps) => (
    <AlertDialogPrimitive.Title
        className={state =>
            cn(
                dialogTitleStyles({ typography }),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

interface AlertDialogDescriptionProps
    extends TypographyOpts, ComponentProps<typeof AlertDialogPrimitive.Description> {}
export const AlertDialogDescription = ({
    className: propClassName,
    typography,
    ...props
}: AlertDialogDescriptionProps) => (
    <AlertDialogPrimitive.Description
        className={state =>
            cn(
                dialogDescriptionStyles({ typography }),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

interface AlertDialogHeaderProps {
    children?: ReactNode
    className?: string
}
export const AlertDialogHeader = (props: AlertDialogHeaderProps) => {
    const { i18n } = useUiContext()

    return (
        <div className={cn(dialogHeaderStyles(), props.className)}>
            {props.children}
            <AlertDialogPrimitive.Close
                className={dialogCloseIconStyles()}
                title={i18n.t("Shared.Close", undefined)}
            >
                <IconXMark />
            </AlertDialogPrimitive.Close>
        </div>
    )
}

interface AlertDialogBodyProps {
    children?: ReactNode
    className?: string
}
export const AlertDialogBody = (props: AlertDialogBodyProps) => (
    <div className={cn(dialogBodyStyles(), props.className)}>{props.children}</div>
)

interface AlertDialogFooterProps {
    children?: ReactNode
    className?: string
}
export const AlertDialogFooter = (props: AlertDialogFooterProps) => <div {...props} />
