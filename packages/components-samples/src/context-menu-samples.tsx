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
                <ContextMenuTrigger className="border-line-muted text-fg-muted flex h-24 w-64 items-center justify-center rounded-lg border-2 border-dashed">
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
