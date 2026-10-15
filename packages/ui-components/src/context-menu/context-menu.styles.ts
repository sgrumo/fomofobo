import { styles } from "frontend-shared/styles"

import {
    menuGroupLabelStyles,
    menuItemStyles,
    menuPopupStyles,
    menuPositionerStyles,
    menuSeparatorStyles,
} from "../menu/menu.styles"

export const contextMenuPositionerStyles = menuPositionerStyles
export const contextMenuPopupStyles = menuPopupStyles
export const contextMenuItemStyles = menuItemStyles
export const contextMenuGroupLabelStyles = menuGroupLabelStyles
export const contextMenuSeparatorStyles = menuSeparatorStyles

export const contextMenuTriggerStyles = styles(() => "cursor-default select-none")
