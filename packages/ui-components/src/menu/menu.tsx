import { Menu as MenuPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"

import { normalizeBaseUiStyling } from "../styling/styling.helper"
import {
    menuGroupLabelStyles,
    menuItemStyles,
    menuPopupStyles,
    menuPositionerStyles,
    menuSeparatorStyles,
} from "./menu.styles"

export const MenuRoot = MenuPrimitive.Root
export const MenuTrigger = MenuPrimitive.Trigger
export const MenuGroup = MenuPrimitive.Group

interface MenuContentProps extends ComponentProps<typeof MenuPrimitive.Popup> {
    positionerProps?: ComponentProps<typeof MenuPrimitive.Positioner>
}
export const MenuContent = ({
    className: propClassName,
    positionerProps: {
        className: positionerClassName,
        sideOffset: positionerSideOffset = 4,
        ...positionerProps
    } = {},
    ...props
}: MenuContentProps) => (
    <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
            className={state =>
                cn(
                    menuPositionerStyles(),
                    normalizeBaseUiStyling(positionerClassName, state),
                )
            }
            sideOffset={positionerSideOffset}
            {...positionerProps}
        >
            <MenuPrimitive.Popup
                className={state =>
                    cn(menuPopupStyles(), normalizeBaseUiStyling(propClassName, state))
                }
                {...props}
            />
        </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
)

interface MenuItemProps extends ComponentProps<typeof MenuPrimitive.Item> {
    variant?: "default" | "destructive"
}
export const MenuItem = ({
    className: propClassName,
    variant = "default",
    ...props
}: MenuItemProps) => (
    <MenuPrimitive.Item
        className={state =>
            cn(menuItemStyles({ variant }), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

export const MenuGroupLabel = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof MenuPrimitive.GroupLabel>) => (
    <MenuPrimitive.GroupLabel
        className={state =>
            cn(menuGroupLabelStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

export const MenuSeparator = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof MenuPrimitive.Separator>) => (
    <MenuPrimitive.Separator
        className={state =>
            cn(menuSeparatorStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)
