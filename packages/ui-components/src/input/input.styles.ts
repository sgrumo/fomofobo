import { styles } from "frontend-shared/styles"

interface InputRootStylesOpts {
    size: "md" | "sm"
    disabled: boolean
    error: boolean
}
export const inputRootStyles = styles((opts: InputRootStylesOpts) => [
    "bg-surface has-[:is(input,textarea):focus-visible]:bg-surface has-[:is(input,textarea):enabled]:has-[:is(input,textarea):not(:focus-visible)]:has-[:is(input,textarea):hover]:bg-surface-muted [&:is(button)[aria-haspopup=dialog]:enabled:not(:focus-visible):hover:not(:has([data-input-reset]:hover))]:bg-surface-muted [&:is(button)[aria-haspopup=dialog]:focus-visible]:bg-surface [&:is(button)[aria-haspopup=dialog][aria-expanded=true]]:bg-surface inline-flex items-center rounded-lg outline-1 -outline-offset-1 transition-colors has-[:is(input,textarea):disabled]:opacity-75 [&:is(button)[aria-haspopup=dialog]:disabled]:opacity-75",
    {
        "outline-line": !opts.error,
        "has-[:is(input,textarea):focus-visible]:outline-focus [&:is(button)[aria-haspopup=dialog][aria-expanded=true]]:outline-focus [&:is(button)[aria-haspopup=dialog]:focus-visible]:outline-focus":
            !opts.error,
        "outline-danger": opts.error && !opts.disabled,
        "h-8 gap-1 px-2 py-1": opts.size === "sm",
        "h-10 gap-2 p-2": opts.size === "md",
    },
])
interface InputViewRootStylesOpts {
    size: "md" | "sm"
    forceSquare: boolean
}
export const inputViewRootStyles = styles((opts: InputViewRootStylesOpts) => [
    "bg-surface outline-line inline-flex items-center rounded-lg outline-1 -outline-offset-1",
    {
        "h-8 gap-1 px-2 py-1": opts.size === "sm",
        "h-10 gap-2 p-2": opts.size === "md",
        "w-8": opts.forceSquare && opts.size === "sm",
        "w-10": opts.forceSquare && opts.size === "md",
    },
])
export const inputViewValueStyles = styles(() => "tp-body-md w-full truncate")
export const inputAffixStyles = styles(
    () => "tp-body-md appearance-none outline-0 select-none",
)
export const inputInputStyles = styles(
    () => "tp-body-md w-full appearance-none outline-0",
)
