import { styles } from "frontend-shared/styles"

interface AvatarRootStylesOpts {
    size: "sm" | "md" | "lg"
}
export const avatarRootStyles = styles((opts: AvatarRootStylesOpts) => [
    "bg-line-muted text-fg-muted relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full select-none",
    {
        "tp-pixel-md size-8": opts.size === "sm",
        "tp-pixel-md size-10": opts.size === "md",
        "tp-pixel-lg size-14": opts.size === "lg",
    },
])

export const avatarImageStyles = styles(() => "size-full rounded-[inherit] object-cover")

export const avatarFallbackStyles = styles(
    () => "flex size-full items-center justify-center",
)
