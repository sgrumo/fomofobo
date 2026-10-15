import { Separator as SeparatorPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"

import { normalizeBaseUiStyling } from "../styling/styling.helper"
import { separatorStyles } from "./separator.styles"

export const Separator = ({
    className: propClassName,
    orientation = "horizontal",
    ...props
}: ComponentProps<typeof SeparatorPrimitive>) => (
    <SeparatorPrimitive
        orientation={orientation}
        className={state =>
            cn(
                separatorStyles({ orientation }),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)
