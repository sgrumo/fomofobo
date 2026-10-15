import { Accordion as AccordionPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"
import type { StrictOmit, ListTail } from "shared/types"

import { IconChevronDown } from "../icons/icons"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import {
    accordionContentStyles,
    accordionItemStyles,
    accordionPanelStyles,
    accordionRootStyles,
    accordionTriggerContentStyles,
    accordionTriggerIconStyles,
    accordionTriggerStyles,
} from "./accordion.styles"

export const AccordionHeader = AccordionPrimitive.Header

interface AccordionRootProps extends StrictOmit<
    ComponentProps<typeof AccordionPrimitive.Root>,
    "value" | "defaultValue" | "onValueChange"
> {
    value?: string[]
    defaultValue?: string[]
    onValueChange?: (
        value: string[],
        ...rest: ListTail<
            Parameters<
                NonNullable<
                    ComponentProps<typeof AccordionPrimitive.Root>["onValueChange"]
                >
            >
        >
    ) => void
}
export const AccordionRoot = ({
    className: propClassName,
    ...props
}: AccordionRootProps) => (
    <AccordionPrimitive.Root
        className={state =>
            cn(accordionRootStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

interface AccordionItemProps extends StrictOmit<
    ComponentProps<typeof AccordionPrimitive.Item>,
    "value"
> {
    value: string
}
export const AccordionItem = ({
    className: propClassName,
    ...props
}: AccordionItemProps) => (
    <AccordionPrimitive.Item
        className={state =>
            cn(accordionItemStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

export const AccordionTrigger = ({
    className: propClassName,
    children,
    ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) => (
    <AccordionPrimitive.Trigger
        className={state =>
            cn(accordionTriggerStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    >
        <div className={accordionTriggerContentStyles()}>{children}</div>
        <IconChevronDown className={accordionTriggerIconStyles()} />
    </AccordionPrimitive.Trigger>
)

export const AccordionPanel = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof AccordionPrimitive.Panel>) => (
    <AccordionPrimitive.Panel
        className={state =>
            cn(accordionPanelStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

export const AccordionContent = ({ className, ...props }: ComponentProps<"div">) => (
    <div className={cn(accordionContentStyles(), className)} {...props} />
)
