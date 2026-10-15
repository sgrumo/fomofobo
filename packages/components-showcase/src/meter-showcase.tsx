import { Meter } from "ui-components/meter"

export const MeterShowcase = () => (
    <div className="flex w-full max-w-[20rem] flex-col gap-6">
        <div className="flex flex-col gap-2">
            <p className="tp-h4-medium">Sm</p>
            <div className="flex flex-col gap-3">
                <Meter value={25} min={0} max={100} size="sm" />
                <Meter value={50} min={0} max={100} size="sm" />
                <Meter value={75} min={0} max={100} size="sm" />
                <Meter value={100} min={0} max={100} size="sm" />
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-medium">Md</p>
            <div className="flex flex-col gap-3">
                <Meter value={25} min={0} max={100} size="md" />
                <Meter value={50} min={0} max={100} size="md" />
                <Meter value={75} min={0} max={100} size="md" />
                <Meter value={100} min={0} max={100} size="md" />
            </div>
        </div>
    </div>
)
