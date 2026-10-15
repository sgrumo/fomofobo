import { styles } from "frontend-shared/styles"

export const ditheredImageRootStyles = styles(() => "relative block overflow-hidden")

export const ditheredImageImgStyles = styles((dithered: boolean) => [
    "block size-full object-cover",
    { "opacity-0": dithered },
])

export const ditheredImageCanvasStyles = styles((dithered: boolean) => [
    "absolute inset-0 size-full object-cover [image-rendering:pixelated]",
    { hidden: !dithered },
])
