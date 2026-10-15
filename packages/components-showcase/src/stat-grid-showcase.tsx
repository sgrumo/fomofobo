import { StatGrid } from "ui-components/stat-grid"

export const StatGridShowcase = () => (
    <div className="flex w-full max-w-[22rem] flex-col gap-6">
        <StatGrid
            items={[
                { label: "Date", value: "Wed 14.10" },
                { label: "Time", value: "21:00→00:30" },
                { label: "Entry", value: "Free" },
                { label: "Distance", value: "350m" },
            ]}
        />
        <StatGrid
            items={[
                { label: "Date", value: "Thu 15.10" },
                { label: "Time", value: "18:00" },
                { label: "Entry", value: "10 €" },
            ]}
        />
    </div>
)
