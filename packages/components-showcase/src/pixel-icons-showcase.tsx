import { PixelIcon, pixelIconNames } from "ui-components/pixel-icons"

export const PixelIconsShowcase = () => (
    <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
        {pixelIconNames.map(name => (
            <div key={name} className="flex flex-col items-center gap-1">
                <PixelIcon name={name} className="size-6" />
                <span className="tp-pixel-sm text-fg-muted">{name}</span>
            </div>
        ))}
    </div>
)
