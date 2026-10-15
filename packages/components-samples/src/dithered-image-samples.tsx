import { DitheredImage } from "ui-components/dithered-image"

const sampleImage = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="40"><rect width="60" height="40" fill="#222"/><circle cx="30" cy="20" r="12" fill="#eee"/></svg>',
)}`

export const DitheredImageSamples = () => (
    <DitheredImage src={sampleImage} alt="Sample dithered image" className="h-20 w-30" />
)
