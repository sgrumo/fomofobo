import GorhomBottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet"
import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { BottomSheetBackground } from "@/components/ui/bottom-sheet/bottom-sheet"
import {
    BOTTOM_SHEET_INSET,
    bottomSheetHandleIndicator,
} from "@/components/ui/bottom-sheet/bottom-sheet.styles"

import {
    bottomSheetPanelContentStyles,
    bottomSheetPanelStyle,
} from "./bottom-sheet-panel.styles"

interface BottomSheetPanelProps {
    open: boolean
    onClose: () => void
    children?: ReactNode
}

// A sheet in the screen tree, with no backdrop: the screen behind stays usable, and the content
// gets new props on the same render, unlike `BottomSheet`, which renders through a portal
const BottomSheetPanel = (props: BottomSheetPanelProps) => {
    const ref = useRef<GorhomBottomSheet>(null)
    const insets = useSafeAreaInsets()

    useEffect(() => {
        if (props.open) {
            ref.current?.snapToIndex(0)
        } else {
            ref.current?.close()
        }
    }, [props.open])

    return (
        <GorhomBottomSheet
            ref={ref}
            index={-1}
            enableDynamicSizing={true}
            enablePanDownToClose={true}
            detached={true}
            bottomInset={insets.bottom + BOTTOM_SHEET_INSET}
            style={bottomSheetPanelStyle}
            backgroundComponent={BottomSheetBackground}
            handleIndicatorStyle={bottomSheetHandleIndicator}
            onClose={() => {
                // A close that `open` asked for is no close of the user
                if (props.open) {
                    props.onClose()
                }
            }}
        >
            <BottomSheetView>
                <View className={bottomSheetPanelContentStyles}>{props.children}</View>
            </BottomSheetView>
        </GorhomBottomSheet>
    )
}

export { BottomSheetPanel }
