import { cn } from "frontend-shared/styles"
import { FallbackBox } from "ui-components/fallback-box"

interface FallbackBoxShowcaseProps {
    className?: string
}
export const FallbackBoxShowcase = (props: FallbackBoxShowcaseProps) => (
    <div className={cn("grid grid-cols-1 gap-8 lg:grid-cols-2", props.className)}>
        <div className="flex flex-col gap-2 self-center">
            <p className="tp-h4-semibold">Empty (default)</p>
            <FallbackBox type="empty" />
        </div>
        <div className="flex flex-col gap-2 self-center">
            <p className="tp-h4-semibold">Empty (with description)</p>
            <FallbackBox
                type="empty"
                title="No items yet"
                description="Create your first item to get started."
            />
        </div>
        <div className="flex flex-col gap-2 self-center">
            <p className="tp-h4-semibold">Error</p>
            <FallbackBox type="error" title="Something went wrong" />
        </div>
        <div className="flex flex-col gap-2 self-center">
            <p className="tp-h4-semibold">Error (with description)</p>
            <FallbackBox
                type="error"
                title="Failed to load data"
                description="An unexpected error occurred while fetching. Please try again later."
            />
        </div>
    </div>
)
