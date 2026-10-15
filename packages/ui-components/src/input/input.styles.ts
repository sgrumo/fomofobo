import { styles } from "frontend-shared/styles"

interface InputRootStylesOpts {
    size: "md" | "sm"
    disabled: boolean
    error: boolean
}
export const inputRootStyles = styles((opts: InputRootStylesOpts) => [
    "inline-flex items-center rounded-lg bg-white outline-1 -outline-offset-1 transition-colors has-[:is(input,textarea):disabled]:opacity-75 has-[:is(input,textarea):focus-visible]:bg-white has-[:is(input,textarea):enabled]:has-[:is(input,textarea):not(:focus-visible)]:has-[:is(input,textarea):hover]:bg-neutral-100 dark:bg-neutral-900 dark:has-[:is(input,textarea):focus-visible]:bg-neutral-900 dark:has-[:is(input,textarea):enabled]:has-[:is(input,textarea):not(:focus-visible)]:has-[:is(input,textarea):hover]:bg-neutral-800 [&:is(button)[aria-haspopup=dialog]:disabled]:opacity-75 [&:is(button)[aria-haspopup=dialog]:enabled:not(:focus-visible):hover:not(:has([data-input-reset]:hover))]:bg-neutral-100 dark:[&:is(button)[aria-haspopup=dialog]:enabled:not(:focus-visible):hover:not(:has([data-input-reset]:hover))]:bg-neutral-800 [&:is(button)[aria-haspopup=dialog]:focus-visible]:bg-white dark:[&:is(button)[aria-haspopup=dialog]:focus-visible]:bg-neutral-900 [&:is(button)[aria-haspopup=dialog][aria-expanded=true]]:bg-white dark:[&:is(button)[aria-haspopup=dialog][aria-expanded=true]]:bg-neutral-900",
    {
        "outline-neutral-400 dark:outline-neutral-600": !opts.error,
        "has-[:is(input,textarea):focus-visible]:outline-primary-600 dark:has-[:is(input,textarea):focus-visible]:outline-primary-300 [&:is(button)[aria-haspopup=dialog][aria-expanded=true]]:outline-primary-600 dark:[&:is(button)[aria-haspopup=dialog][aria-expanded=true]]:outline-primary-300 [&:is(button)[aria-haspopup=dialog]:focus-visible]:outline-primary-600 dark:[&:is(button)[aria-haspopup=dialog]:focus-visible]:outline-primary-300":
            !opts.error,
        "outline-danger-600 dark:outline-danger-400": opts.error && !opts.disabled,
        "h-8 gap-1 px-2 py-1": opts.size === "sm",
        "h-10 gap-2 p-2": opts.size === "md",
    },
])
interface InputViewRootStylesOpts {
    size: "md" | "sm"
    forceSquare: boolean
}
export const inputViewRootStyles = styles((opts: InputViewRootStylesOpts) => [
    "inline-flex items-center rounded-lg bg-white outline-1 -outline-offset-1 outline-neutral-400 dark:bg-neutral-900 dark:outline-neutral-600",
    {
        "h-8 gap-1 px-2 py-1": opts.size === "sm",
        "h-10 gap-2 p-2": opts.size === "md",
        "w-8": opts.forceSquare && opts.size === "sm",
        "w-10": opts.forceSquare && opts.size === "md",
    },
])
export const inputViewValueStyles = styles(() => "tp-b2-regular w-full truncate")
export const inputAffixStyles = styles(
    () => "tp-b2-regular appearance-none outline-0 select-none",
)
export const inputInputStyles = styles(
    () => "tp-b2-regular w-full appearance-none outline-0",
)
