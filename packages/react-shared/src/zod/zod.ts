import type { ReactElement } from "react"
import {
    isContextConsumer,
    isContextProvider,
    isElement,
    isForwardRef,
    isFragment,
    isLazy,
    isMemo,
    isPortal,
    isProfiler,
    isStrictMode,
    isSuspense,
} from "react-is"
import { z } from "zod"

export const reactElementSchema = z.union([
    z.custom<ReactElement>(isContextConsumer),
    z.custom<ReactElement>(isContextProvider),
    z.custom<ReactElement>(isElement),
    z.custom<ReactElement>(isForwardRef),
    z.custom<ReactElement>(isFragment),
    z.custom<ReactElement>(isLazy),
    z.custom<ReactElement>(isMemo),
    z.custom<ReactElement>(isProfiler),
    z.custom<ReactElement>(isPortal),
    z.custom<ReactElement>(isStrictMode),
    z.custom<ReactElement>(isSuspense),
])
/**
 * @remarks Accepts one level of array nesting only
 */
export const reactNodeSchema = (() => {
    const singleReactNodeSchema = z.union([
        reactElementSchema,
        z.string(),
        z.number(),
        z.bigint(),
        z.boolean(),
        z.null(),
        z.undefined(),
    ])
    return z.union([singleReactNodeSchema, z.array(singleReactNodeSchema)])
})()
