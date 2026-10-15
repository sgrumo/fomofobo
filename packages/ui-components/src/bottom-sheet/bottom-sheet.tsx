import { Drawer as DrawerPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"
import type { StrictOmit } from "shared/types"

import { normalizeBaseUiStyling } from "../styling/styling.helper"
import {
    bottomSheetContentStyles,
    bottomSheetHandleStyles,
    bottomSheetPopupStyles,
} from "./bottom-sheet.styles"

export {
    DrawerDescription as BottomSheetDescription,
    DrawerTitle as BottomSheetTitle,
} from "../drawer/drawer"

export const BottomSheetTrigger = DrawerPrimitive.Trigger
export const BottomSheetClose = DrawerPrimitive.Close

type BottomSheetRootProps = StrictOmit<
    ComponentProps<typeof DrawerPrimitive.Root>,
    "swipeDirection"
>
export const BottomSheetRoot = (props: BottomSheetRootProps) => (
    <DrawerPrimitive.Root swipeDirection="down" modal={false} {...props} />
)

interface BottomSheetContentProps extends Pick<
    ComponentProps<typeof DrawerPrimitive.Popup>,
    "className"
> {
    children?: ReactNode
}
export const BottomSheetContent = (props: BottomSheetContentProps) => (
    <DrawerPrimitive.Portal>
        <DrawerPrimitive.Viewport>
            <DrawerPrimitive.Popup
                className={state =>
                    cn(
                        bottomSheetPopupStyles(),
                        normalizeBaseUiStyling(props.className, state),
                    )
                }
            >
                <div className={bottomSheetHandleStyles()} />
                <DrawerPrimitive.Content className={bottomSheetContentStyles()}>
                    {props.children}
                </DrawerPrimitive.Content>
            </DrawerPrimitive.Popup>
        </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
)
