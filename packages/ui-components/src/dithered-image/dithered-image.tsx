import { cn } from "frontend-shared/styles"
import { useEffect, useRef, useState } from "react"
import type { ComponentProps } from "react"
import type { StrictOmit } from "shared/types"

import { ditherPixels, parseHexColor } from "./dithered-image.helper"
import {
    ditheredImageCanvasStyles,
    ditheredImageImgStyles,
    ditheredImageRootStyles,
} from "./dithered-image.styles"

/**
 * @description Draws the dithered image on the canvas and returns true when it succeeds
 * @param image Loaded source image
 * @param canvas Target canvas
 * @param pixelSize Side of one dither cell in image pixels
 * @remarks Returns false when the canvas has no 2D context, a token color is not hex, or a cross-origin image without CORS taints the canvas
 */
const drawDither = (
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    pixelSize: number,
): boolean => {
    const context = canvas.getContext("2d", { willReadFrequently: true })
    const style = getComputedStyle(canvas)
    const dark = parseHexColor(style.getPropertyValue("--color-surface-inverse"))
    const light = parseHexColor(style.getPropertyValue("--color-live"))
    if (!context || !dark || !light || image.naturalWidth === 0) {
        return false
    }

    const width = Math.max(1, Math.round(image.naturalWidth / pixelSize))
    const height = Math.max(1, Math.round(image.naturalHeight / pixelSize))
    canvas.width = width
    canvas.height = height
    context.drawImage(image, 0, 0, width, height)

    try {
        const source = context.getImageData(0, 0, width, height)
        context.putImageData(
            new ImageData(ditherPixels(source.data, width, dark, light), width, height),
            0,
            0,
        )
        return true
    } catch {
        return false
    }
}

interface DitheredImageProps extends StrictOmit<
    ComponentProps<"img">,
    "alt" | "className"
> {
    alt: string
    dither?: boolean
    pixelSize?: number
    className?: string
}
export const DitheredImage = ({
    alt,
    dither = true,
    pixelSize = 3,
    className,
    onLoad,
    ...props
}: DitheredImageProps) => {
    const imageRef = useRef<HTMLImageElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [dithered, setDithered] = useState(false)

    const applyDither = () => {
        const image = imageRef.current
        const canvas = canvasRef.current
        setDithered(
            dither &&
                !!image &&
                !!canvas &&
                image.complete &&
                drawDither(image, canvas, pixelSize),
        )
    }

    // An image served from the cache can finish loading before hydration, so `onLoad` never fires for it
    useEffect(applyDither, [dither, pixelSize, props.src])

    return (
        <span className={cn(ditheredImageRootStyles(), className)}>
            <img
                ref={imageRef}
                alt={alt}
                className={ditheredImageImgStyles(dithered)}
                onLoad={event => {
                    applyDither()
                    onLoad?.(event)
                }}
                {...props}
            />
            <canvas
                ref={canvasRef}
                aria-hidden={true}
                className={ditheredImageCanvasStyles(dithered)}
            />
        </span>
    )
}
