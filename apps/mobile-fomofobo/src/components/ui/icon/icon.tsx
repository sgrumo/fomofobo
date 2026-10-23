import type { LucideIcon, LucideProps } from "lucide-react-native"
import { cssInterop } from "nativewind"

import { cn } from "@/lib/utils/class-names"

type IconProps = LucideProps & {
    as: LucideIcon
}

const IconImpl = ({ as: IconComponent, ...props }: IconProps) => (
    <IconComponent {...props} />
)

cssInterop(IconImpl, {
    className: {
        target: "style",
        nativeStyleToProp: {
            height: "size",
            width: "size",
        },
    },
})

const Icon = ({ as: IconComponent, className, size = 14, ...props }: IconProps) => (
    <IconImpl
        as={IconComponent}
        className={cn("text-foreground", className)}
        size={size}
        {...props}
    />
)

export { Icon }
