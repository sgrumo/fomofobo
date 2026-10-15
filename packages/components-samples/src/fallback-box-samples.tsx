import { FallbackBox } from "ui-components/fallback-box"

export const FallbackBoxSamples = () => (
    <div className="flex flex-col gap-4">
        <FallbackBox type="empty" />
        <FallbackBox
            type="error"
            title="Fallback error title"
            description="Fallback error description"
        />
    </div>
)
