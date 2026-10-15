import { useState } from "react"
import { Chip, ChipRow } from "ui-components/chip"
import { PixelIconArt, PixelIconComedy, PixelIconMusic } from "ui-components/pixel-icons"

const categories = [
    { id: "music", label: "Music", count: 12, icon: <PixelIconMusic /> },
    { id: "comedy", label: "Comedy", count: 4, icon: <PixelIconComedy /> },
    { id: "art", label: "Art", count: 7, icon: <PixelIconArt /> },
]

export const ChipShowcase = () => {
    const [selected, setSelected] = useState<string | undefined>(undefined)

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
        </div>
    )
}
