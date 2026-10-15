import type { ComponentProps, CSSProperties, ElementType } from "react"
import type { EmptyObject } from "shared/types"

export type Typography = "default" | "override"
export interface TypographyOpts {
    typography?: Typography
}

/**
 * @description True when the typography is left at the default
 * @param opts Typography setting read
 */
export const typographyNotOverridden = (opts: TypographyOpts) =>
    !opts.typography || opts.typography === "default"

/**
 * @description Returns the styling value, or its result when the styling is a function
 * @template S State type passed to a function styling
 * @template T Styling value type
 * @param styling Styling value, or a builder taking the state
 * @param state State passed to the builder
 * @remarks Yields an empty object for an undefined styling value
 */
export const normalizeBaseUiStyling = <S, T extends CSSProperties | string | undefined>(
    styling: T | ((state: S) => T),
    state: S,
): T | EmptyObject => (typeof styling === "function" ? styling(state) : (styling ?? {}))

/**
 * @description Returns the state a Base UI `className` function receives
 * @template C Component type owning the `className` prop
 */
type BaseUiClassNameState<C extends ElementType> = Parameters<
    Extract<ComponentProps<C>["className"], (...args: never[]) => unknown>
>[0]

/**
 * @description Returns the `className` type accepting a string or a mode-aware builder
 * @template C Component type driving the edit-mode state
 */
export type SwitchableModeClassName<C extends ElementType> =
    | string
    | ((
          arg: { mode: "view" } | { mode: "edit"; state: BaseUiClassNameState<C> },
      ) => string)
