import { useState } from "react"
import { Chip, ChipBar, ChipRow } from "ui-components/chip"

export const ChipSamples = () => {
    const [music, setMusic] = useState(false)
    const [comedy, setComedy] = useState(false)
    const [day, setDay] = useState<"today" | "tomorrow">()

    return (
        <ChipRow label="Sample chip row">
            <Chip
                label="Sample Music Chip"
                count={12}
                pressed={music}
                onPressedChange={setMusic}
            />
            <Chip
                label="Sample Comedy Chip"
                pressed={comedy}
                onPressedChange={setComedy}
            />
            <ChipBar label="Sample chip bar">
                <Chip
                    label="Sample Today Chip"
                    pressed={day === "today"}
                    onPressedChange={pressed => {
                        setDay(pressed ? "today" : undefined)
                    }}
                />
                <Chip
                    label="Sample Tomorrow Chip"
                    pressed={day === "tomorrow"}
                    onPressedChange={pressed => {
                        setDay(pressed ? "tomorrow" : undefined)
                    }}
                />
            </ChipBar>
        </ChipRow>
    )
}
