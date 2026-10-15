import { styles } from "frontend-shared/styles"

interface TooltipTriggerStylesOpts {
    customRender: boolean
}
export const tooltipTriggerStyles = styles((opts: TooltipTriggerStylesOpts) => ({
    "cursor-default hover:cursor-default": !opts.customRender,
}))

export const tooltipPopupStyles = styles(
    () =>
        "tp-c1-regular origin-(--transform-origin) rounded-sm bg-neutral-800 p-2 text-white transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-neutral-900",
)

export const tooltipArrowStyles = styles(
    () =>
        "data-[side=bottom]:-top-2.5 data-[side=bottom]:rotate-0 data-[side=left]:-right-2.5 data-[side=left]:rotate-90 data-[side=right]:-left-2.5 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2.5 data-[side=top]:rotate-180 [&>svg]:size-4 [&>svg]:text-neutral-800 dark:[&>svg]:text-neutral-900",
)
