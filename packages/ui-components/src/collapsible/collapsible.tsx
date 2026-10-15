import { Collapsible as CollapsiblePrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"

import { IconChevronDown } from "../icons/icons"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import {
    collapsibleContentStyles,
    collapsiblePanelStyles,
    collapsibleRootStyles,
    collapsibleTriggerContentStyles,
    collapsibleTriggerIconStyles,
    collapsibleTriggerStyles,
} from "./collapsible.styles"

export const CollapsibleRoot = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof CollapsiblePrimitive.Root>) => (
    <CollapsiblePrimitive.Root
        className={state =>
            cn(collapsibleRootStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

export const CollapsibleTrigger = ({
    className: propClassName,
    children,
    ...props
}: ComponentProps<typeof CollapsiblePrimitive.Trigger>) => (
    <CollapsiblePrimitive.Trigger
        className={state =>
            cn(collapsibleTriggerStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    >
        <div className={collapsibleTriggerContentStyles()}>{children}</div>
        <IconChevronDown className={collapsibleTriggerIconStyles()} />
    </CollapsiblePrimitive.Trigger>
)

export const CollapsiblePanel = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof CollapsiblePrimitive.Panel>) => (
    <CollapsiblePrimitive.Panel
        className={state =>
            cn(collapsiblePanelStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

export const CollapsibleContent = ({ className, ...props }: ComponentProps<"div">) => (
    <div className={cn(collapsibleContentStyles(), className)} {...props} />
)
