import type { VariantProps } from "class-variance-authority"
import { Pressable } from "react-native"

import { TextClassContext } from "@/components/ui/text/text"
import { cn } from "@/lib/utils/class-names"

import { buttonTextVariants, buttonVariants } from "./button.styles"

type ButtonProps = React.ComponentProps<typeof Pressable> &
    React.RefAttributes<typeof Pressable> &
    VariantProps<typeof buttonVariants>

const Button = ({ className, variant, size, ...props }: ButtonProps) => (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
        <Pressable
            className={cn(
                props.disabled && "opacity-50",
                buttonVariants({ variant, size }),
                className,
            )}
            role="button"
            {...props}
        />
    </TextClassContext.Provider>
)

export { Button, buttonVariants }
export type { ButtonProps }
