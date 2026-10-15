import { useState } from "react"
import { IconButton } from "ui-components/icon-button"
import { PixelIconLocate } from "ui-components/pixel-icons"

export const IconButtonSamples = () => {
    const [clicks, setClicks] = useState(0)

    return (
        <div className="flex items-center gap-3">
            <IconButton
                aria-label="Sample icon button"
                icon={<PixelIconLocate />}
                onClick={() => {
                    setClicks(clicks + 1)
                }}
            />
            <span>{`Icon button clicks: ${String(clicks)}`}</span>
        </div>
    )
}
