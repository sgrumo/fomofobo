import { styles } from "frontend-shared/styles"

export const fallbackBoxStyles = styles(
    () =>
        "border-line mx-auto flex w-fit max-w-[35rem] flex-col items-center gap-2 self-center rounded-lg border p-6 text-center",
)

export const fallbackBoxHeaderStyles = styles(() => "flex w-fit items-center gap-2")

export const fallbackBoxIconStyles = styles(() => "text-fg-subtle size-8")

export const fallbackBoxTitleStyles = styles(() => "tp-pixel-lg text-fg-muted")

export const fallbackBoxDescriptionStyles = styles(() => "tp-body-lg text-fg-muted")
