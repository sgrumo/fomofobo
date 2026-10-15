import type { ComponentProps } from "react"
import type { StrictOmit } from "shared/types"

import type { PixelIconName } from "./pixel-icons.helper"
import { PIXEL_ICON_GRID, pixelIconBitmaps, pixelIconPath } from "./pixel-icons.helper"

type PixelIconProps = StrictOmit<ComponentProps<"svg">, "name">

interface PixelIconByNameProps extends PixelIconProps {
    name: PixelIconName
}
export const PixelIcon = ({ name, ...props }: PixelIconByNameProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${String(PIXEL_ICON_GRID)} ${String(PIXEL_ICON_GRID)}`}
        shapeRendering="crispEdges"
        aria-hidden={true}
        {...props}
    >
        <path fill="currentColor" d={pixelIconPath(pixelIconBitmaps[name])} />
    </svg>
)

export const PixelIconSearch = (props: PixelIconProps) => (
    <PixelIcon name="search" {...props} />
)

export const PixelIconLocate = (props: PixelIconProps) => (
    <PixelIcon name="locate" {...props} />
)

export const PixelIconBack = (props: PixelIconProps) => (
    <PixelIcon name="back" {...props} />
)

export const PixelIconShare = (props: PixelIconProps) => (
    <PixelIcon name="share" {...props} />
)

export const PixelIconArrow = (props: PixelIconProps) => (
    <PixelIcon name="arrow" {...props} />
)

export const PixelIconDirections = (props: PixelIconProps) => (
    <PixelIcon name="directions" {...props} />
)

export const PixelIconInstagram = (props: PixelIconProps) => (
    <PixelIcon name="instagram" {...props} />
)

export const PixelIconFacebook = (props: PixelIconProps) => (
    <PixelIcon name="facebook" {...props} />
)

export const PixelIconSave = (props: PixelIconProps) => (
    <PixelIcon name="save" {...props} />
)

export const PixelIconSaved = (props: PixelIconProps) => (
    <PixelIcon name="saved" {...props} />
)

export const PixelIconClose = (props: PixelIconProps) => (
    <PixelIcon name="close" {...props} />
)

export const PixelIconCalendar = (props: PixelIconProps) => (
    <PixelIcon name="calendar" {...props} />
)

export const PixelIconMusic = (props: PixelIconProps) => (
    <PixelIcon name="music" {...props} />
)

export const PixelIconComedy = (props: PixelIconProps) => (
    <PixelIcon name="comedy" {...props} />
)

export const PixelIconArt = (props: PixelIconProps) => <PixelIcon name="art" {...props} />

export const PixelIconTheatre = (props: PixelIconProps) => (
    <PixelIcon name="theatre" {...props} />
)

export const PixelIconCinema = (props: PixelIconProps) => (
    <PixelIcon name="cinema" {...props} />
)

export const PixelIconFood = (props: PixelIconProps) => (
    <PixelIcon name="food" {...props} />
)

export const PixelIconParty = (props: PixelIconProps) => (
    <PixelIcon name="party" {...props} />
)

export const PixelIconTalk = (props: PixelIconProps) => (
    <PixelIcon name="talk" {...props} />
)

export const PixelIconSport = (props: PixelIconProps) => (
    <PixelIcon name="sport" {...props} />
)

export const PixelIconMarket = (props: PixelIconProps) => (
    <PixelIcon name="market" {...props} />
)

export const PixelIconOther = (props: PixelIconProps) => (
    <PixelIcon name="other" {...props} />
)
