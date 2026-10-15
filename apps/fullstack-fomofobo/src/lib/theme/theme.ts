import { storagePrefix } from "frontend-shared/storage"
import { match } from "ts-pattern"
import { z } from "zod"

export const themeSchema = z.enum(["light", "dark", "system"])
export type Theme = z.output<typeof themeSchema>

export const defaultTheme: Theme = "system"

export type ThemeClass = "dark" | "system"
export const themeClasses: ThemeClass[] = ["dark", "system"]

/**
 * @remarks Mirrors the key `createWebStorage` builds for the `theme` item of the local
 * storage, so the page script reads what the switcher writes
 */
export const themeStorageKey = `${storagePrefix}:theme`

/**
 * @description Returns the class of the document root that selects the theme
 * @param theme Theme applied
 * @remarks `system` is a class of its own: the stylesheet pairs it with
 * `prefers-color-scheme`, so no script has to read the OS preference
 */
export const themeClass = (theme: Theme): ThemeClass | undefined =>
    match(theme)
        .returnType<ThemeClass | undefined>()
        .with("dark", () => "dark")
        .with("system", () => "system")
        .with("light", () => undefined)
        .exhaustive()

/**
 * @description Adds the theme class of the stored value to the root element
 * @param storage Storage the theme wrapper writes
 * @param root Element receiving the class, the document root in the page
 * @param key Prefixed storage key of the theme
 * @remarks Self-contained on purpose: `themeScript` inlines its source with `toString()`,
 * so a reference to any other binding of this module breaks the page script
 */
export const applyStoredTheme = (
    storage: Pick<Storage, "getItem">,
    root: { classList: Pick<DOMTokenList, "add"> },
    key: string,
) => {
    const readStored = (): unknown => {
        try {
            const raw = storage.getItem(key)
            return raw === null ? undefined : JSON.parse(raw)
        } catch {
            return undefined
        }
    }

    const readTheme = (): Theme => {
        const stored = readStored()
        switch (stored) {
            case "light":
            case "dark":
            case "system": {
                return stored
            }
            default: {
                return "system"
            }
        }
    }

    const classOf = (theme: Theme): ThemeClass | undefined => {
        switch (theme) {
            case "dark": {
                return "dark"
            }
            case "system": {
                return "system"
            }
            case "light": {
                return undefined
            }
            default: {
                const exhaustive: never = theme
                return exhaustive
            }
        }
    }

    const className = classOf(readTheme())
    if (className !== undefined) {
        root.classList.add(className)
    }
}

/**
 * @remarks Inline script of the root layout. Runs before the first paint, so the page
 * never flashes the light theme and stays static: no request is read on the server
 */
export const themeScript = `(${applyStoredTheme.toString()})(localStorage, document.documentElement, ${JSON.stringify(themeStorageKey)})`
