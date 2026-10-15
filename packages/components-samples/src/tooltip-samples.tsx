import { Button } from "ui-components/button"
import { Tooltip } from "ui-components/tooltip"

export const TooltipSamples = () => (
    <Tooltip
        active={true}
        content="Sample tooltip content"
        trigger={{ render: triggerProps => <div {...triggerProps} /> }}
    >
        <Button variant="secondary" size="md" type="button">
            Tooltip trigger button
        </Button>
    </Tooltip>
)
