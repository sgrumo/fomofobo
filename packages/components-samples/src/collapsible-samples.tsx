import {
    CollapsibleContent,
    CollapsiblePanel,
    CollapsibleRoot,
    CollapsibleTrigger,
} from "ui-components/collapsible"

export const CollapsibleSamples = () => (
    <CollapsibleRoot>
        <CollapsibleTrigger>Collapsible Trigger</CollapsibleTrigger>
        <CollapsiblePanel>
            <CollapsibleContent>Collapsible sample content</CollapsibleContent>
        </CollapsiblePanel>
    </CollapsibleRoot>
)
