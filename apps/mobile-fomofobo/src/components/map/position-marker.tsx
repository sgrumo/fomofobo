import {
    MARKER_CELL_PX,
    POSITION_CORE,
    POSITION_HALO,
    POSITION_HALO_FRAME_MS,
} from "domain/pixel-markers"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import Svg, { Path } from "react-native-svg"

import { PixelSprite } from "@/components/map/pixel-sprite"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"

const CORE_SIZE = POSITION_CORE.cells * MARKER_CELL_PX

export const PositionMarker = () => {
    const { t } = useTranslation("shared")

    return (
        <View
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={t("Map.Position")}
            style={{ width: CORE_SIZE, height: CORE_SIZE }}
        >
            <PixelSprite
                sprite={POSITION_HALO}
                frameMs={POSITION_HALO_FRAME_MS}
                color={THEME_COLORS.position}
                box={CORE_SIZE}
            />
            <Svg
                width={CORE_SIZE}
                height={CORE_SIZE}
                viewBox={`0 0 ${String(POSITION_CORE.cells)} ${String(POSITION_CORE.cells)}`}
            >
                <Path d={POSITION_CORE.fillPath} fill={THEME_COLORS.position} />
                <Path d={POSITION_CORE.ringPath} fill={THEME_COLORS.line} />
            </Svg>
        </View>
    )
}
