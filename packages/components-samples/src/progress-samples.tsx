import { Progress } from "ui-components/progress"

export const ProgressSamples = () => (
    <div className="flex w-full max-w-[20rem] flex-col gap-3">
        <Progress min={0} max={100} value={60} />
        <Progress min={0} max={100} value={100} />
    </div>
)
