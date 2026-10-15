import { cn } from "frontend-shared/styles"
import { useState } from "react"
import {
    CollapsibleContent,
    CollapsiblePanel,
    CollapsibleRoot,
    CollapsibleTrigger,
} from "ui-components/collapsible"

interface CollapsibleShowcaseProps {
    className?: string
}
export const CollapsibleShowcase = (props: CollapsibleShowcaseProps) => (
    <div
        className={cn(
            "grid h-full w-full grid-cols-1 items-start gap-4 lg:grid-cols-3",
            props.className,
        )}
    >
        <div className="flex flex-col gap-4">
            <p className="tp-pixel-lg">Uncontrolled</p>
            <CollapsibleUncontrolledShowcase />
        </div>
        <div className="flex flex-col gap-4">
            <p className="tp-pixel-lg">Default open</p>
            <CollapsibleDefaultOpenShowcase />
        </div>
        <div className="flex flex-col gap-4">
            <p className="tp-pixel-lg">Controlled</p>
            <CollapsibleControlledShowcase />
        </div>
    </div>
)

const CollapsibleUncontrolledShowcase = () => (
    <CollapsibleRoot>
        <CollapsibleTrigger>What is a collapsible?</CollapsibleTrigger>
        <CollapsiblePanel>
            <CollapsibleContent>
                A collapsible is a component that can be expanded or collapsed to show or
                hide content. It is commonly used for FAQs, settings panels, and other
                sections where content can be toggled.
            </CollapsibleContent>
        </CollapsiblePanel>
    </CollapsibleRoot>
)

const CollapsibleDefaultOpenShowcase = () => (
    <CollapsibleRoot defaultOpen={true}>
        <CollapsibleTrigger>This starts open</CollapsibleTrigger>
        <CollapsiblePanel>
            <CollapsibleContent>
                This content is visible by default because the collapsible was initialized
                with defaultOpen set to true.
            </CollapsibleContent>
        </CollapsiblePanel>
    </CollapsibleRoot>
)

const CollapsibleControlledShowcase = () => {
    const [open, setOpen] = useState(false)

    return (
        <CollapsibleRoot open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger>
                Controlled ({open ? "open" : "closed"})
            </CollapsibleTrigger>
            <CollapsiblePanel>
                <CollapsibleContent>
                    This collapsible is controlled externally. The parent component
                    manages the open/closed state.
                </CollapsibleContent>
            </CollapsiblePanel>
        </CollapsibleRoot>
    )
}
