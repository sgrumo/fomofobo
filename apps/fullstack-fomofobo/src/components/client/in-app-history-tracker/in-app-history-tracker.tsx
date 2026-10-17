"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { recordInAppPath } from "@/lib/navigation/in-app-history"

export const InAppHistoryTracker = () => {
    const pathname = usePathname()

    useEffect(() => {
        recordInAppPath(pathname)
    }, [pathname])

    return undefined
}
