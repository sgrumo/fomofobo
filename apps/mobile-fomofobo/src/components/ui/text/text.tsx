import * as Slot from "@rn-primitives/slot"
import type { VariantProps } from "class-variance-authority"
import { createContext, useContext } from "react"
import { Text as RNText } from "react-native"

import { cn } from "@/lib/utils/class-names"

import { textVariants } from "./text.styles"

export const TextClassContext = createContext<string | undefined>(undefined)

type TextProps = React.ComponentProps<typeof RNText> &
    VariantProps<typeof textVariants> &
    React.RefAttributes<RNText> & {
        asChild?: boolean
    }

const Text = ({ className, asChild = false, variant, ...props }: TextProps) => {
    const textClass = useContext(TextClassContext)
    const Component = asChild ? Slot.Text : RNText
    return (
        <Component
            className={cn(textVariants({ variant }), textClass, className)}
            {...props}
        />
    )
}

export { Text }
