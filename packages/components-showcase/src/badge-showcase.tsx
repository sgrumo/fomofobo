import { Badge } from "ui-components/badge"

export const BadgeShowcase = () => (
    <div className="flex flex-wrap items-center gap-3">
        <Badge tone="live" dot={true}>
            Ongoing
        </Badge>
        <Badge tone="live">Live</Badge>
        <Badge tone="upcoming">21:30</Badge>
        <Badge tone="ended">Ended</Badge>
        <Badge tone="permanent">Cinema</Badge>
        <Badge tone="neutral" dot={true}>
            14.10.26
        </Badge>
        <Badge tone="inverse">Photo 1/6</Badge>
    </div>
)
