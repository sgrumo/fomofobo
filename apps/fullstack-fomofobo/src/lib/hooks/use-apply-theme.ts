import { useLayoutEffect } from "react"

import { localStorage } from "@/lib/storage/local-storage"
import type { Theme } from "@/lib/theme/theme"
import { themeClass, themeClasses } from "@/lib/theme/theme"

/**
 * @description Applies the stored theme, then again after every write of the storage
 * @remarks Reads the storage in the layout effect, not through `useLocalStorage`: during
 * hydration that hook yields the default theme, which drops the class `themeScript` set
 */
export const useApplyTheme = () => {
    useLayoutEffect(() => {
        const applyStored = () => {
            applyTheme(localStorage.getItem("theme"))
        }
        applyStored()
        return localStorage.listen(applyStored)
    }, [])
}

/**
 * @description Removes every theme class from the document root, then adds the one of the theme
 * @param theme Theme applied
 */
const applyTheme = (theme: Theme) => {
    const { classList } = globalThis.document.documentElement
    classList.remove(...themeClasses)
    const next = themeClass(theme)
    if (next !== undefined) {
        classList.add(next)
    }
}
