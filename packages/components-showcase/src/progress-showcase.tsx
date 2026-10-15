import { Progress } from "ui-components/progress"

export const ProgressShowcase = () => (
    <div className="flex w-full max-w-[20rem] flex-col gap-6">
        <div className="flex flex-col gap-2">
            <p className="tp-h4-medium">Sm</p>
            <div className="flex flex-col gap-3">
                <Progress value={25} min={0} max={100} size="sm" />
                <Progress value={50} min={0} max={100} size="sm" />
                <Progress value={75} min={0} max={100} size="sm" />
                <Progress value={100} min={0} max={100} size="sm" />
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-medium">Md</p>
            <div className="flex flex-col gap-3">
                <Progress value={Number.NaN} min={0} max={100} size="md" />
                <Progress value={50} min={0} max={100} size="md" />
                <Progress value={75} min={0} max={100} size="md" />
                <Progress value={100} min={0} max={100} size="md" />
            </div>
        </div>
    </div>
)
