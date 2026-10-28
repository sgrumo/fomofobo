import { PIXEL_GLYPH_GRID, PIXEL_GLYPHS } from "domain/pixel-glyphs"
import { pixelIconPath } from "domain/pixel-icons"
import { categoryIconValues } from "models"

// Two px per cell, as on a map disc, and four to read the cells
const SCALES = [2, 4] as const

export const PixelGlyphsShowcase = () => (
    <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
        {categoryIconValues.map(icon => (
            <div key={icon} className="flex flex-col items-center gap-1">
                <div className="flex items-end gap-2">
                    {SCALES.map(scale => (
                        <svg
                            key={scale}
                            aria-hidden={true}
                            width={PIXEL_GLYPH_GRID * scale}
                            height={PIXEL_GLYPH_GRID * scale}
                            viewBox={`0 0 ${String(PIXEL_GLYPH_GRID)} ${String(PIXEL_GLYPH_GRID)}`}
                            shapeRendering="crispEdges"
                            className="fill-fg"
                        >
                            <path d={pixelIconPath(PIXEL_GLYPHS[icon])} />
                        </svg>
                    ))}
                </div>
                <span className="tp-pixel-sm text-fg-muted">{icon}</span>
            </div>
        ))}
    </div>
)
