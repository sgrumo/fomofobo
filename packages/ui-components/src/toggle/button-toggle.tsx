import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"
import type { StrictOmit } from "shared/types"

import { normalizeBaseUiStyling } from "../styling/styling.helper"
import {
    buttonToggleGroupItemStyles,
    buttonToggleGroupStyles,
    buttonToggleStyles,
} from "./button-toggle.styles"
import { Toggle, ToggleGroup } from "./toggle"
import type { MultipleToggleGroupProps, SingleToggleGroupProps } from "./toggle"

export const ButtonToggle = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof Toggle>) => (
    <Toggle
        className={arg =>
            cn(
                arg.mode === "edit" && buttonToggleStyles(),
                normalizeBaseUiStyling(propClassName, arg),
            )
        }
        {...props}
    />
)

interface BaseButtonToggleGroupProps<T extends string> {
    getItemIcon: (item: T) => ReactNode
}

type SingleButtonToggleGroupProps<T extends string> = StrictOmit<
    SingleToggleGroupProps<T>,
    "renderItem"
> &
    BaseButtonToggleGroupProps<T>

type MultipleButtonToggleGroupProps<T extends string> = StrictOmit<
    MultipleToggleGroupProps<T>,
    "renderItem"
> &
    BaseButtonToggleGroupProps<T>

type ButtonToggleGroupProps<T extends string> =
    | SingleButtonToggleGroupProps<T>
    | MultipleButtonToggleGroupProps<T>

const SingleButtonToggleGroup = <T extends string>({
    getItemIcon,
    className: propClassName,
    ...props
}: SingleButtonToggleGroupProps<T>) => (
    <ToggleGroup
        {...props}
        multiple={false}
        className={arg =>
            cn(
                arg.mode === "edit" && buttonToggleGroupStyles(),
                normalizeBaseUiStyling(propClassName, arg),
            )
        }
        renderItem={({ item, toggled }) => (
            <span className={buttonToggleGroupItemStyles({ toggled })}>
                {getItemIcon(item)}
            </span>
        )}
    />
)

const MultipleButtonToggleGroup = <T extends string>({
    getItemIcon,
    className: propClassName,
    ...props
}: MultipleButtonToggleGroupProps<T>) => (
    <ToggleGroup
        {...props}
        multiple={true}
        className={arg =>
            cn(
                arg.mode === "edit" && buttonToggleGroupStyles(),
                normalizeBaseUiStyling(propClassName, arg),
            )
        }
        renderItem={({ item, toggled }) => (
            <span className={buttonToggleGroupItemStyles({ toggled })}>
                {getItemIcon(item)}
            </span>
        )}
    />
)

export const ButtonToggleGroup = <T extends string>(props: ButtonToggleGroupProps<T>) =>
    props.multiple ? (
        <MultipleButtonToggleGroup {...props} />
    ) : (
        <SingleButtonToggleGroup {...props} />
    )
