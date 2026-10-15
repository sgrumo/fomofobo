import { Dialog as DialogPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"

import { useUiContext } from "../i18n/ui-context"
import { IconXMark } from "../icons/icons"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { TypographyOpts } from "../styling/styling.helper"
import {
    dialogBackdropStyles,
    dialogBodyStyles,
    dialogCloseIconStyles,
    dialogDescriptionStyles,
    dialogPopupStyles,
    dialogHeaderStyles,
    dialogTitleStyles,
} from "./dialog.styles"

export const DialogRoot = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

interface DialogContentProps extends Pick<
    ComponentProps<typeof DialogPrimitive.Popup>,
    "className"
> {
    children?: ReactNode
}
export const DialogContent = ({
    className: propClassName,
    children,
}: DialogContentProps) => (
    <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className={dialogBackdropStyles()} />
        <DialogPrimitive.Viewport>
            <DialogPrimitive.Popup
                className={state =>
                    cn(dialogPopupStyles(), normalizeBaseUiStyling(propClassName, state))
                }
            >
                {children}
            </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
)

interface DialogTitleProps
    extends TypographyOpts, ComponentProps<typeof DialogPrimitive.Title> {}
export const DialogTitle = ({
    className: propClassName,
    typography,
    ...props
}: DialogTitleProps) => (
    <DialogPrimitive.Title
        className={state =>
            cn(
                dialogTitleStyles({ typography }),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

interface DialogDescriptionProps
    extends TypographyOpts, ComponentProps<typeof DialogPrimitive.Description> {}
export const DialogDescription = ({
    className: propClassName,
    typography,
    ...props
}: DialogDescriptionProps) => (
    <DialogPrimitive.Description
        className={state =>
            cn(
                dialogDescriptionStyles({ typography }),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

interface DialogHeaderProps {
    children?: ReactNode
    className?: string
}
export const DialogHeader = (props: DialogHeaderProps) => {
    const { i18n } = useUiContext()

    return (
        <div className={cn(dialogHeaderStyles(), props.className)}>
            {props.children}
            <DialogPrimitive.Close
                className={dialogCloseIconStyles()}
                title={i18n.t("Shared.Close", undefined)}
            >
                <IconXMark />
            </DialogPrimitive.Close>
        </div>
    )
}

interface DialogBodyProps {
    children?: ReactNode
    className?: string
}
export const DialogBody = (props: DialogBodyProps) => (
    <div className={cn(dialogBodyStyles(), props.className)}>{props.children}</div>
)

interface DialogFooterProps {
    children?: ReactNode
    className?: string
}
export const DialogFooter = (props: DialogFooterProps) => <div {...props} />
