import { StatGrid } from "ui-components/stat-grid"

export const StatGridSamples = () => (
    <div className="w-full max-w-[20rem]">
        <StatGrid
            items={[
                { label: "Sample stat date", value: "Sample stat Wed 14.10" },
                { label: "Sample stat entry", value: "Sample stat free" },
            ]}
        />
    </div>
)
