import { styles } from "frontend-shared/styles"

interface TooltipTriggerStylesOpts {
    customRender: boolean
}
export const tooltipTriggerStyles = styles((opts: TooltipTriggerStylesOpts) => ({
    "cursor-default hover:cursor-default": !opts.customRender,
}))

export const tooltipPopupStyles = styles(
    () =>
        "tp-pixel-sm bg-surface-inverse text-fg-inverse origin-(--transform-origin) rounded-sm px-2 py-1.5 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
)

export const tooltipArrowStyles = styles(
    () =>
        "[&>svg]:text-surface-inverse data-[side=bottom]:-top-2.5 data-[side=bottom]:rotate-0 data-[side=left]:-right-2.5 data-[side=left]:rotate-90 data-[side=right]:-left-2.5 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2.5 data-[side=top]:rotate-180 [&>svg]:size-4",
)
