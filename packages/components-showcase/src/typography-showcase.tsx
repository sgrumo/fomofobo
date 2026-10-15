const typographies = [
    { utility: "tp-pixel-2xl", font: "Space Mono" },
    { utility: "tp-pixel-xl", font: "Space Mono" },
    { utility: "tp-pixel-lg", font: "Space Mono" },
    { utility: "tp-pixel-md", font: "Space Mono" },
    { utility: "tp-pixel-sm", font: "Space Mono" },
    { utility: "tp-body-lg", font: "Funnel Sans" },
    { utility: "tp-body-md", font: "Funnel Sans" },
    { utility: "tp-body-sm", font: "Funnel Sans" },
] as const

const sampleText = "The quick brown fox jumps over the lazy dog"

export const TypographyShowcase = () => (
    <div className="flex w-full flex-col gap-4">
        {typographies.map(tp => (
            <div
                key={tp.utility}
                className="border-line-muted flex flex-col gap-1 border-b pb-4"
            >
                <div className="flex items-center gap-2">
                    <span className="tp-pixel-sm bg-surface-muted text-fg-muted rounded-sm px-2 py-0.5">
                        {tp.utility}
                    </span>
                    <span className="tp-body-sm text-fg-muted">{tp.font}</span>
                </div>
                <p className={tp.utility}>{sampleText}</p>
            </div>
        ))}
    </div>
)
