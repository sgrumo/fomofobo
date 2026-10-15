import { DitheredImage } from "ui-components/dithered-image"

import { stagePhotoDataUrl } from "./components-showcase.helper"

export const DitheredImageShowcase = () => (
    <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-col gap-1">
            <DitheredImage
                src={stagePhotoDataUrl}
                alt="Stage photo, dithered"
                className="border-line h-40 w-60 rounded-lg border-2"
            />
            <span className="tp-pixel-sm">Dither</span>
        </div>
        <div className="flex flex-col gap-1">
            <DitheredImage
                src={stagePhotoDataUrl}
                alt="Stage photo, plain"
                dither={false}
                className="border-line h-40 w-60 rounded-lg border-2"
            />
            <span className="tp-pixel-sm">Fallback</span>
        </div>
    </div>
)
