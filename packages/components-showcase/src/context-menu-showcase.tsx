import { cn } from "frontend-shared/styles"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuGroupLabel,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "ui-components/context-menu"

interface ContextMenuShowcaseProps {
    className?: string
}
export const ContextMenuShowcase = (props: ContextMenuShowcaseProps) => (
    <div className={cn("flex flex-col gap-6", props.className)}>
        <p className="tp-h4-semibold">Basic</p>
        <ContextMenuBasicShowcase />
        <p className="tp-h4-semibold">With groups</p>
        <ContextMenuGroupsShowcase />
    </div>
)

const ContextMenuBasicShowcase = () => (
    <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
            Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent>
            <ContextMenuItem>Cut</ContextMenuItem>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
        </ContextMenuContent>
    </ContextMenu>
)

const ContextMenuGroupsShowcase = () => (
    <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
            Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent>
            <ContextMenuGroup>
                <ContextMenuGroupLabel>Edit</ContextMenuGroupLabel>
                <ContextMenuItem>Undo</ContextMenuItem>
                <ContextMenuItem>Redo</ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
                <ContextMenuGroupLabel>Clipboard</ContextMenuGroupLabel>
                <ContextMenuItem>Cut</ContextMenuItem>
                <ContextMenuItem>Copy</ContextMenuItem>
                <ContextMenuItem>Paste</ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
        </ContextMenuContent>
    </ContextMenu>
)
