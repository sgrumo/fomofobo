import { cn } from "frontend-shared/styles"
import { Alert } from "ui-components/alert"

interface AlertShowcaseProps {
    className?: string
}
export const AlertShowcase = (props: AlertShowcaseProps) => (
    <div className={cn("grid w-full grid-cols-1 gap-6 lg:grid-cols-2", props.className)}>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Info</p>
            <Alert type="info" text="This is an informational message." />
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Success</p>
            <Alert type="success" text="Operation completed successfully." />
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Warning</p>
            <Alert type="warning" text="Please review the changes before proceeding." />
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Error</p>
            <Alert type="error" text="Something went wrong. Please try again." />
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Loading</p>
            <Alert type="loading" text="Processing your request..." />
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-h4-semibold">Multiple lines</p>
            <Alert
                type="warning"
                text={[
                    "First warning message.",
                    "Second warning message.",
                    "Third warning message.",
                ]}
            />
        </div>
    </div>
)
