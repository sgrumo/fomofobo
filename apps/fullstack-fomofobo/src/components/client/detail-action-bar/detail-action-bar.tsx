"use client"

import type { ReactNode } from "react"

interface DetailActionBarProps {
    label: string
    children: ReactNode
}

export const DetailActionBar = (props: DetailActionBarProps) => (
    <nav
        aria-label={props.label}
        // The shadow covers the bottom padding of the scroll area, which content would show through
        className="bg-surface border-line sticky bottom-0 -mx-4 flex gap-3 border-t-2 p-4 shadow-[0_1rem_0_0_var(--color-surface)]"
    >
        {props.children}
    </nav>
)
