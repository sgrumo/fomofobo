import GorhomBottomSheet, {
    BottomSheetFooter,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet"
import type { BottomSheetFooterProps } from "@gorhom/bottom-sheet"
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
    DETAIL_SHEET_SNAP_POINTS,
    detailSheetContentStyle,
    detailSheetContentWithFooterStyle,
    detailSheetFooterStyles,
    detailSheetStyle,
} from "./detail-sheet.styles"

interface DetailSheetProps {
    open: boolean
    onClose: () => void
    footer?: ReactNode
    children?: ReactNode
}

// A tall sheet in the screen tree, with no backdrop, that scrolls its content and keeps the
// top of the screen behind in view
const DetailSheet = (props: DetailSheetProps) => {
    const ref = useRef<GorhomBottomSheet>(null)
    const insets = useSafeAreaInsets()
    const footer = props.footer

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
            snapPoints={DETAIL_SHEET_SNAP_POINTS}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            detached={true}
            topInset={insets.top}
            bottomInset={insets.bottom + BOTTOM_SHEET_INSET}
            style={detailSheetStyle}
            backgroundComponent={BottomSheetBackground}
            handleIndicatorStyle={bottomSheetHandleIndicator}
            footerComponent={
                footer === undefined
                    ? undefined
                    : (footerProps: BottomSheetFooterProps) => (
                          <BottomSheetFooter {...footerProps}>
                              <View className={detailSheetFooterStyles}>{footer}</View>
                          </BottomSheetFooter>
                      )
            }
            onClose={() => {
                // A close that `open` asked for is no close of the user
                if (props.open) {
                    props.onClose()
                }
            }}
        >
            <BottomSheetScrollView
                contentContainerStyle={
                    footer === undefined
                        ? detailSheetContentStyle
                        : detailSheetContentWithFooterStyle
                }
            >
                {props.children}
            </BottomSheetScrollView>
        </GorhomBottomSheet>
    )
}

export { DetailSheet }
