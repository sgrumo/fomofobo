import { Alert } from "ui-components/alert"

export const AlertSamples = () => (
    <div className="flex w-full flex-col gap-2">
        <Alert type="error" text="Alert error message" />
        <Alert type="warning" text="Alert warning message" />
        <Alert type="info" text="Alert info message" />
        <Alert type="success" text="Alert success message" />
        <Alert type="loading" text="Alert loading message" />
    </div>
)
