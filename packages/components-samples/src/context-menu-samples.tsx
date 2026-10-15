import { useState } from "react"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "ui-components/context-menu"

export const ContextMenuSamples = () => {
    const [selected, setSelected] = useState<"none" | "one">("none")

    return (
        <div className="flex flex-col items-start gap-4">
            <ContextMenu>
                <ContextMenuTrigger className="flex h-24 w-64 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
                    Context Menu Target
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem
                        onClick={() => {
                            setSelected("one")
                        }}
                    >
                        Context Action One
                    </ContextMenuItem>
                    <ContextMenuItem>Context Action Two</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <p>Context selected: {selected}</p>
        </div>
    )
}
