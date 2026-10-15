import { Spinner } from "ui-components/spinner"

export const SpinnerShowcase = () => (
    <div className="flex items-center gap-8">
        <Spinner size="xs" title="Extra small" />
        <Spinner size="sm" title="Small" />
        <Spinner size="md" title="Medium" />
        <Spinner size="lg" title="Large" />
    </div>
)
