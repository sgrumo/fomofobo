import { Timeline } from "ui-components/timeline"

export const TimelineSamples = () => (
    <div className="w-full max-w-[20rem]">
        <Timeline
            label="Sample timeline"
            value={48}
            min={0}
            max={210}
            valueText="Sample timeline value text"
            start="Sample timeline start"
            now="Sample timeline now"
            end="Sample timeline end"
        />
    </div>
)
