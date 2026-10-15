import { Tabs as TabsPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"
import type { StrictOmit } from "shared/types"

import { normalizeBaseUiStyling } from "../styling/styling.helper"
import {
    tabsIndicatorStyles,
    tabsListStyles,
    tabsPanelStyles,
    tabsRootStyles,
    tabsTabStyles,
} from "./tabs.styles"

interface TabsRootProps extends StrictOmit<
    ComponentProps<typeof TabsPrimitive.Root>,
    "value" | "onValueChange"
> {
    value?: string | number
    onValueChange?: (
        value: string | number,
        eventDetails: TabsPrimitive.Root.ChangeEventDetails,
    ) => void
}
export const TabsRoot = ({ className: propClassName, ...props }: TabsRootProps) => (
    <TabsPrimitive.Root
        className={state =>
            cn(tabsRootStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

export const TabsList = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof TabsPrimitive.List>) => (
    <TabsPrimitive.List
        className={state =>
            cn(tabsListStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

export const TabsTab = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof TabsPrimitive.Tab>) => (
    <TabsPrimitive.Tab
        className={state =>
            cn(tabsTabStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

export const TabsIndicator = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof TabsPrimitive.Indicator>) => (
    <TabsPrimitive.Indicator
        className={state =>
            cn(tabsIndicatorStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

export const TabsPanel = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof TabsPrimitive.Panel>) => (
    <TabsPrimitive.Panel
        className={state =>
            cn(tabsPanelStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)
