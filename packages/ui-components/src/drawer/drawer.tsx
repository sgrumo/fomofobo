import { Drawer as DrawerPrimitive } from "@base-ui/react"
import { identity } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useContext } from "react"
import type { ComponentProps, ReactNode } from "react"
import type { StrictOmit } from "shared/types"
import { match } from "ts-pattern"

import { useUiContext } from "../i18n/ui-context"
import { IconXMark } from "../icons/icons"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { TypographyOpts } from "../styling/styling.helper"
import type { DrawerSide } from "./drawer.helper"
import { DrawerContext, defaultDrawerContext } from "./drawer.helper"
import {
    drawerBackdropStyles,
    drawerBodyStyles,
    drawerCloseIconStyles,
    drawerContentStyles,
    drawerDescriptionStyles,
    drawerHandleStyles,
    drawerHeaderContentStyles,
    drawerHeaderStyles,
    drawerPopupStyles,
    drawerTitleStyles,
} from "./drawer.styles"

export const DrawerProvider = DrawerPrimitive.Provider
export const DrawerTrigger = DrawerPrimitive.Trigger
export const DrawerClose = DrawerPrimitive.Close

interface DrawerProps extends StrictOmit<
    ComponentProps<typeof DrawerPrimitive.Root>,
    "swipeDirection" | "handle"
> {
    side: DrawerSide
    showHandle?: boolean
}
export const DrawerRoot = ({
    side,
    showHandle: propShowHandle,
    ...props
}: DrawerProps) => {
    const swipeDirection = match(side)
        .returnType<
            NonNullable<ComponentProps<typeof DrawerPrimitive.Root>["swipeDirection"]>
        >()
        .with("top", () => "up")
        .with("bottom", () => "down")
        .otherwise(identity)

    const handle = propShowHandle ?? defaultDrawerContext.showHandle

    return (
        <DrawerContext value={{ side, showHandle: handle }}>
            <DrawerPrimitive.Root swipeDirection={swipeDirection} {...props} />
        </DrawerContext>
    )
}

interface DrawerContentProps extends Pick<
    ComponentProps<typeof DrawerPrimitive.Popup>,
    "className"
> {
    children?: ReactNode
}
export const DrawerContent = (props: DrawerContentProps) => {
    const context = useContext(DrawerContext)
    return (
        <DrawerPrimitive.Portal>
            <DrawerPrimitive.Backdrop className={drawerBackdropStyles()} />
            <DrawerPrimitive.Viewport>
                <DrawerPrimitive.Popup
                    className={state =>
                        cn(
                            drawerPopupStyles({ side: context.side }),
                            normalizeBaseUiStyling(props.className, state),
                        )
                    }
                >
                    {context.showHandle && (
                        <div
                            className={drawerHandleStyles({
                                side: context.side,
                            })}
                        />
                    )}
                    <DrawerPrimitive.Content
                        className={drawerContentStyles({ side: context.side })}
                    >
                        {props.children}
                    </DrawerPrimitive.Content>
                </DrawerPrimitive.Popup>
            </DrawerPrimitive.Viewport>
        </DrawerPrimitive.Portal>
    )
}

interface DrawerTitleProps
    extends TypographyOpts, ComponentProps<typeof DrawerPrimitive.Title> {}
export const DrawerTitle = ({
    className: propClassName,
    typography,
    ...props
}: DrawerTitleProps) => (
    <DrawerPrimitive.Title
        className={state =>
            cn(
                drawerTitleStyles({ typography }),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

interface DrawerDescriptionProps
    extends TypographyOpts, ComponentProps<typeof DrawerPrimitive.Description> {}
export const DrawerDescription = ({
    className: propClassName,
    typography,
    ...props
}: DrawerDescriptionProps) => (
    <DrawerPrimitive.Description
        className={state =>
            cn(
                drawerDescriptionStyles({ typography }),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

interface DrawerHeaderProps {
    children?: ReactNode
    className?: string
}
export const DrawerHeader = (props: DrawerHeaderProps) => {
    const { i18n } = useUiContext()

    return (
        <div className={cn(drawerHeaderStyles(), props.className)}>
            <div className={drawerHeaderContentStyles()}>{props.children}</div>
            <DrawerPrimitive.Close
                className={drawerCloseIconStyles()}
                title={i18n.t("Shared.Close", undefined)}
            >
                <IconXMark />
            </DrawerPrimitive.Close>
        </div>
    )
}

interface DrawerBodyProps {
    children?: ReactNode
    className?: string
}
export const DrawerBody = (props: DrawerBodyProps) => (
    <div className={cn(drawerBodyStyles(), props.className)}>{props.children}</div>
)
