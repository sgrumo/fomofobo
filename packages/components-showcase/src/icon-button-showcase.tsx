import { IconButton } from "ui-components/icon-button"
import {
    PixelIconArrow,
    PixelIconBack,
    PixelIconLocate,
    PixelIconShare,
} from "ui-components/pixel-icons"

export const IconButtonShowcase = () => (
    <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
            <IconButton aria-label="Locate small" size="sm" icon={<PixelIconLocate />} />
            <IconButton aria-label="Locate" icon={<PixelIconLocate />} />
            <IconButton aria-label="Locate large" size="lg" icon={<PixelIconLocate />} />
        </div>
        <div className="flex flex-wrap items-center gap-4">
            <IconButton aria-label="Back" tone="surface" icon={<PixelIconBack />} />
            <IconButton aria-label="Share" tone="surface" icon={<PixelIconShare />} />
            <IconButton
                aria-label="Open event"
                tone="live"
                size="lg"
                icon={<PixelIconArrow />}
            />
            <IconButton aria-label="Inverse" tone="inverse" icon={<PixelIconLocate />} />
            <IconButton
                aria-label="Disabled"
                disabled={true}
                icon={<PixelIconLocate />}
            />
        </div>
    </div>
)
