import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet"
import type {
    BottomSheetBackdropProps,
    BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet"
import type { ReactNode, RefObject } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { IconButton } from "@/components/ui/icon-button/icon-button"
import { PixelPanel } from "@/components/ui/pixel-panel/pixel-panel"
import { Text } from "@/components/ui/text/text"

import {
    BOTTOM_SHEET_BACKDROP_OPACITY,
    BOTTOM_SHEET_INSET,
    bottomSheetBackgroundStyles,
    bottomSheetContentStyles,
    bottomSheetHandleIndicator,
    bottomSheetHeaderStyles,
    bottomSheetModalStyle,
    bottomSheetTitleStyles,
} from "./bottom-sheet.styles"

const PixelBackground = (props: BottomSheetBackgroundProps) => (
    <View style={props.style} pointerEvents="none">
        <PixelPanel shadow="lg" className={bottomSheetBackgroundStyles} />
    </View>
)

const Backdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
        animatedIndex={props.animatedIndex}
        animatedPosition={props.animatedPosition}
        style={props.style}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={BOTTOM_SHEET_BACKDROP_OPACITY}
        pressBehavior="close"
    />
)

interface BottomSheetProps {
    ref: RefObject<BottomSheetModal | null>
    title: string
    onDismiss?: () => void
    children?: ReactNode
}

// Opens with `ref.current.present()`, the API of `BottomSheetModal`
const BottomSheet = ({ ref, ...props }: BottomSheetProps) => {
    const { t } = useTranslation("ui")
    const insets = useSafeAreaInsets()

    return (
        <BottomSheetModal
            ref={ref}
            onDismiss={props.onDismiss}
            enableDynamicSizing={true}
            enablePanDownToClose={true}
            detached={true}
            bottomInset={insets.bottom + BOTTOM_SHEET_INSET}
            style={bottomSheetModalStyle}
            backgroundComponent={PixelBackground}
            backdropComponent={Backdrop}
            handleIndicatorStyle={bottomSheetHandleIndicator}
        >
            <BottomSheetScrollView contentContainerClassName={bottomSheetContentStyles}>
                <View className={bottomSheetHeaderStyles}>
                    <Text
                        variant="pixel-md"
                        accessibilityRole="header"
                        className={bottomSheetTitleStyles}
                    >
                        {props.title}
                    </Text>
                    <IconButton
                        icon="close"
                        size="sm"
                        label={t("BottomSheet.Close")}
                        onPress={() => {
                            ref.current?.dismiss()
                        }}
                    />
                </View>
                {props.children}
            </BottomSheetScrollView>
        </BottomSheetModal>
    )
}

export { BottomSheet }
