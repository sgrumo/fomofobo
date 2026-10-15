"use client"

import { useIsClientRender } from "react-shared"

import { useApplyTheme } from "@/lib/hooks/use-apply-theme"
import { themeScript } from "@/lib/theme/theme"

export const DocumentTheme = () => {
    useApplyTheme()
    const isClientRender = useIsClientRender()
    if (isClientRender) {
        return undefined
    }

    // SAFETY: `themeScript` is a constant built from this codebase, no input.
    // oxlint-disable-next-line react/no-danger
    return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
}
