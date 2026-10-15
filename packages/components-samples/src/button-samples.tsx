import { useState } from "react"
import { Button } from "ui-components/button"
import { IconPlus } from "ui-components/icons"

export const ButtonSamples = () => {
    const [clicks, setClicks] = useState(0)
    const increment = () => {
        setClicks(current => current + 1)
    }

    return (
        <div className="flex flex-col items-start gap-4">
            <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="md" type="button" onClick={increment}>
                    Sample Button
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    type="button"
                    icon={<IconPlus className="size-4" />}
                    aria-label="Icon Sample Button"
                    onClick={increment}
                />
                <Button variant="primary" size="md" type="button" disabled={true}>
                    Disabled Button
                </Button>
            </div>
            <p>Button clicks: {clicks}</p>
        </div>
    )
}
