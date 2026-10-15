import { styles } from "frontend-shared/styles"

export const timelineRootStyles = styles(() => "flex w-full flex-col gap-1.5")

export const timelineLabelsStyles = styles(
    () => "tp-pixel-sm text-fg-muted grid grid-cols-3 gap-2",
)

export const timelineNowStyles = styles(() => "text-fg text-center")

export const timelineEndStyles = styles(() => "text-right")
