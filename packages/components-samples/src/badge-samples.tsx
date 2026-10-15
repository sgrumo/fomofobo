import { Badge } from "ui-components/badge"

export const BadgeSamples = () => (
    <div className="flex gap-3">
        <Badge tone="live" dot={true}>
            Sample live badge
        </Badge>
        <Badge tone="upcoming">Sample upcoming badge</Badge>
    </div>
)
