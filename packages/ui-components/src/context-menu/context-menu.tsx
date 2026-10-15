import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"

import { normalizeBaseUiStyling } from "../styling/styling.helper"
import {
    contextMenuGroupLabelStyles,
    contextMenuItemStyles,
    contextMenuPopupStyles,
    contextMenuPositionerStyles,
    contextMenuSeparatorStyles,
    contextMenuTriggerStyles,
} from "./context-menu.styles"

export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuGroup = ContextMenuPrimitive.Group

export const ContextMenuTrigger = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.Trigger>) => (
    <ContextMenuPrimitive.Trigger
        className={state =>
            cn(contextMenuTriggerStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

interface ContextMenuContentProps extends ComponentProps<
    typeof ContextMenuPrimitive.Popup
> {
    positionerProps?: ComponentProps<typeof ContextMenuPrimitive.Positioner>
}
export const ContextMenuContent = ({
    className: propClassName,
    positionerProps: { className: positionerClassName, ...positionerProps } = {},
    ...props
}: ContextMenuContentProps) => (
    <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Positioner
            className={state =>
                cn(
                    contextMenuPositionerStyles(),
                    normalizeBaseUiStyling(positionerClassName, state),
                )
            }
            {...positionerProps}
        >
            <ContextMenuPrimitive.Popup
                className={state =>
                    cn(
                        contextMenuPopupStyles(),
                        normalizeBaseUiStyling(propClassName, state),
                    )
                }
                {...props}
            />
        </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
)

interface ContextMenuItemProps extends ComponentProps<typeof ContextMenuPrimitive.Item> {
    variant?: "default" | "destructive"
}
export const ContextMenuItem = ({
    className: propClassName,
    variant = "default",
    ...props
}: ContextMenuItemProps) => (
    <ContextMenuPrimitive.Item
        className={state =>
            cn(
                contextMenuItemStyles({ variant }),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

export const ContextMenuGroupLabel = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.GroupLabel>) => (
    <ContextMenuPrimitive.GroupLabel
        className={state =>
            cn(
                contextMenuGroupLabelStyles(),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

export const ContextMenuSeparator = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.Separator>) => (
    <ContextMenuPrimitive.Separator
        className={state =>
            cn(contextMenuSeparatorStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)
