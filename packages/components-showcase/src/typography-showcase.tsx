const typographies = [
    { utility: "tp-d1", label: "Display 1", font: "Funnel Display" },
    { utility: "tp-d2", label: "Display 2", font: "Funnel Display" },
    { utility: "tp-d3", label: "Display 3", font: "Funnel Display" },
    { utility: "tp-d4", label: "Display 4", font: "Funnel Display" },
    { utility: "tp-h1", label: "Heading 1", font: "Funnel Display" },
    { utility: "tp-h2-semibold", label: "Heading 2 Semibold", font: "Funnel Display" },
    { utility: "tp-h2-medium", label: "Heading 2 Medium", font: "Funnel Display" },
    { utility: "tp-h2-regular", label: "Heading 2 Regular", font: "Funnel Display" },
    { utility: "tp-h3-semibold", label: "Heading 3 Semibold", font: "Funnel Display" },
    { utility: "tp-h3-medium", label: "Heading 3 Medium", font: "Funnel Display" },
    { utility: "tp-h3-regular", label: "Heading 3 Regular", font: "Funnel Display" },
    { utility: "tp-h4-semibold", label: "Heading 4 Semibold", font: "Funnel Display" },
    { utility: "tp-h4-medium", label: "Heading 4 Medium", font: "Funnel Display" },
    { utility: "tp-h4-regular", label: "Heading 4 Regular", font: "Funnel Display" },
    {
        utility: "tp-b1-semibold",
        label: "Body 1 Semibold",
        font: "Funnel Sans",
    },
    {
        utility: "tp-b1-medium",
        label: "Body 1 Medium",
        font: "Funnel Sans",
    },
    {
        utility: "tp-b1-regular",
        label: "Body 1 Regular",
        font: "Funnel Sans",
    },
    {
        utility: "tp-b2-semibold",
        label: "Body 2 Semibold",
        font: "Funnel Sans",
    },
    {
        utility: "tp-b2-medium",
        label: "Body 2 Medium",
        font: "Funnel Sans",
    },
    {
        utility: "tp-b2-regular",
        label: "Body 2 Regular",
        font: "Funnel Sans",
    },
    {
        utility: "tp-c1-semibold",
        label: "Caption 1 Semibold",
        font: "Funnel Sans",
    },
    {
        utility: "tp-c1-medium",
        label: "Caption 1 Medium",
        font: "Funnel Sans",
    },
    {
        utility: "tp-c1-regular",
        label: "Caption 1 Regular",
        font: "Funnel Sans",
    },
    { utility: "tp-mono-b1", label: "Mono B1", font: "Roboto Mono" },
    { utility: "tp-mono-b2", label: "Mono B2", font: "Roboto Mono" },
    { utility: "tp-mono-c1", label: "Mono C1", font: "Roboto Mono" },
] as const

const sampleText = "The quick brown fox jumps over the lazy dog"

export const TypographyShowcase = () => (
    <div className="flex w-full flex-col gap-4">
        {typographies.map(tp => (
            <div
                key={tp.utility}
                className="flex flex-col gap-1 border-b border-neutral-200 pb-4 dark:border-neutral-700"
            >
                <div className="flex items-center gap-2">
                    <span className="tp-mono-c1 rounded-md bg-neutral-100 px-2 py-0.5 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {tp.utility}
                    </span>
                    <span className="tp-c1-regular text-neutral-400 dark:text-neutral-500">
                        {tp.font}
                    </span>
                </div>
                <p className={tp.utility}>{sampleText}</p>
            </div>
        ))}
    </div>
)
