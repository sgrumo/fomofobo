import { TickProgress } from "ui-components/tick-progress"

export const TickProgressSamples = () => (
    <div className="w-full max-w-[20rem]">
        <TickProgress
            label="Sample tick progress"
            value={30}
            min={0}
            max={120}
            valueText="Sample tick value text"
        />
    </div>
)
