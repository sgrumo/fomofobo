import { styles } from "frontend-shared/styles"

export const fallbackBoxStyles = styles(
    () =>
        "mx-auto flex w-fit max-w-[35rem] flex-col items-center gap-2 self-center rounded-lg border border-neutral-400 p-6 text-center dark:border-neutral-600",
)

export const fallbackBoxHeaderStyles = styles(() => "flex w-fit items-center gap-2")

export const fallbackBoxIconStyles = styles(
    () => "size-8 text-neutral-400 dark:text-neutral-500",
)

export const fallbackBoxTitleStyles = styles(
    () => "tp-h4-semibold text-neutral-600 dark:text-neutral-300",
)

export const fallbackBoxDescriptionStyles = styles(
    () => "tp-b1-regular text-neutral-600 dark:text-neutral-300",
)
