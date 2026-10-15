import { TickProgress } from "ui-components/tick-progress"

export const TickProgressShowcase = () => (
    <div className="flex w-full max-w-[22rem] flex-col gap-4">
        <TickProgress label="Elapsed 0%" value={0} min={0} max={100} />
        <TickProgress label="Elapsed 62%" value={62} min={0} max={100} valueText="62%" />
        <TickProgress
            label="Elapsed 35% live"
            value={35}
            min={0}
            max={100}
            valueText="35%"
            tone="live"
        />
        <TickProgress label="Elapsed 100%" value={100} min={0} max={100} />
    </div>
)
