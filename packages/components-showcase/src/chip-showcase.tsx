import { useState } from "react"
import { Chip, ChipBar, ChipRow } from "ui-components/chip"
import type { ChipTone } from "ui-components/chip"
import { PixelIconArt, PixelIconComedy, PixelIconMusic } from "ui-components/pixel-icons"

const categories = [
    { id: "music", label: "Music", count: 12, icon: <PixelIconMusic /> },
    { id: "comedy", label: "Comedy", count: 4, icon: <PixelIconComedy /> },
    { id: "art", label: "Art", count: 7, icon: <PixelIconArt /> },
]

const kinds: Array<{ tone: ChipTone; label: string; count: number }> = [
    { tone: "live", label: "Live", count: 3 },
    { tone: "upcoming", label: "Upcoming", count: 12 },
    { tone: "permanent", label: "Programme", count: 5 },
    { tone: "ended", label: "Ended", count: 8 },
]

export const ChipShowcase = () => {
    const [selected, setSelected] = useState<string | undefined>(undefined)
    const [day, setDay] = useState<string>()
    const [shownKinds, setShownKinds] = useState<readonly ChipTone[]>([
        "live",
        "upcoming",
    ])

    return (
        <div className="bg-map-ground w-full max-w-[24rem] p-3">
            <ChipRow label="Categories">
                <Chip
                    label="All"
                    pressed={selected === undefined}
                    onPressedChange={() => {
                        setSelected(undefined)
                    }}
                />
                {categories.map(category => (
                    <Chip
                        key={category.id}
                        label={category.label}
                        count={category.count}
                        icon={category.icon}
                        pressed={selected === category.id}
                        onPressedChange={pressed => {
                            setSelected(pressed ? category.id : undefined)
                        }}
                    />
                ))}
                <Chip label="Disabled" disabled={true} />
            </ChipRow>
            <ChipRow label="Dates">
                <ChipBar label="Days">
                    {["Today", "Tomorrow", "Weekend", "Dates…"].map(label => (
                        <Chip
                            key={label}
                            label={label}
                            pressed={day === label}
                            onPressedChange={pressed => {
                                setDay(pressed ? label : undefined)
                            }}
                        />
                    ))}
                </ChipBar>
                <Chip label="Free" />
            </ChipRow>
            <ChipRow label="Kinds">
                {kinds.map(kind => (
                    <Chip
                        key={kind.tone}
                        label={kind.label}
                        count={kind.count}
                        tone={kind.tone}
                        pressed={shownKinds.includes(kind.tone)}
                        onPressedChange={pressed => {
                            setShownKinds(shown =>
                                pressed
                                    ? [...shown, kind.tone]
                                    : shown.filter(tone => tone !== kind.tone),
                            )
                        }}
                    />
                ))}
            </ChipRow>
        </div>
    )
}
