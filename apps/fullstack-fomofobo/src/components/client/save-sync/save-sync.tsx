"use client"

import { useEffect } from "react"

import { flushSaveChanges, startSaveSync } from "@/lib/saves/save-sync"

export const SaveSync = () => {
    useEffect(() => {
        void startSaveSync()
        const flush = () => {
            void flushSaveChanges()
        }
        globalThis.addEventListener("online", flush)
        return () => {
            globalThis.removeEventListener("online", flush)
        }
    }, [])

    return undefined
}
