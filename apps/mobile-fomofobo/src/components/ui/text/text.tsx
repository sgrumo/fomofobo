import * as Slot from "@rn-primitives/slot"
import type { VariantProps } from "class-variance-authority"
import { createContext, useContext } from "react"
import { Text as RNText } from "react-native"

import { cn } from "@/lib/utils/class-names"

import { ARIA_LEVEL, ROLE, textVariants } from "./text.styles"

export const TextClassContext = createContext<string | undefined>(undefined)

const Text = ({
    className,
    asChild = false,
    variant = "default",
    ...props
}: React.ComponentProps<typeof RNText> &
    VariantProps<typeof textVariants> &
    React.RefAttributes<RNText> & {
        asChild?: boolean
    }) => {
    const textClass = useContext(TextClassContext)
    const Component = asChild ? Slot.Text : RNText
    return (
        <Component
            className={cn(textVariants({ variant }), textClass, className)}
            role={variant ? ROLE[variant] : undefined}
            aria-level={variant ? ARIA_LEVEL[variant] : undefined}
            {...props}
        />
    )
}

export { Text }
