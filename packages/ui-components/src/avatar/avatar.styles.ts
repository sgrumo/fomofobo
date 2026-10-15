import { styles } from "frontend-shared/styles"

interface AvatarRootStylesOpts {
    size: "sm" | "md" | "lg"
}
export const avatarRootStyles = styles((opts: AvatarRootStylesOpts) => [
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-neutral-600 select-none dark:bg-neutral-700 dark:text-neutral-300",
    {
        "tp-b2-medium size-8": opts.size === "sm",
        "tp-b1-medium size-10": opts.size === "md",
        "tp-h4-semibold size-14": opts.size === "lg",
    },
])

export const avatarImageStyles = styles(() => "size-full rounded-[inherit] object-cover")

export const avatarFallbackStyles = styles(
    () => "flex size-full items-center justify-center",
)
