import { useState } from "react"
import { Chip, ChipRow } from "ui-components/chip"

export const ChipSamples = () => {
    const [music, setMusic] = useState(false)
    const [comedy, setComedy] = useState(false)

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
        </ChipRow>
    )
}
