import { createContext } from "react"

export type DrawerSide = "top" | "right" | "bottom" | "left"

export interface DrawerContext {
    side: DrawerSide
    showHandle: boolean
}
export const defaultDrawerContext: DrawerContext = {
    side: "right",
    showHandle: true,
}
export const DrawerContext = createContext<DrawerContext>(defaultDrawerContext)
