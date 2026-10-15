import { Timeline } from "ui-components/timeline"

export const TimelineShowcase = () => (
    <div className="flex w-full max-w-[22rem] flex-col gap-6">
        <Timeline
            label="Event time"
            value={48}
            min={0}
            max={210}
            valueText="21:48"
            start="21:00"
            now="Now 21:48"
            end="00:30"
        />
        <Timeline
            label="Event time live"
            value={150}
            min={0}
            max={210}
            valueText="23:30"
            start="21:00"
            now="Now 23:30"
            end="00:30"
            tone="live"
        />
    </div>
)
