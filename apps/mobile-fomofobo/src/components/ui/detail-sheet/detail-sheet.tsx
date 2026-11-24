import GorhomBottomSheet, {
    BottomSheetFooter,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet"
import type { BottomSheetFooterProps } from "@gorhom/bottom-sheet"
import { useEffect, useRef, useState } from "react"
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
    DETAIL_SHEET_TOP_GAP,
    detailSheetContentStyle,
    detailSheetFooterStyles,
    detailSheetStyle,
} from "./detail-sheet.styles"

interface DetailSheetProps {
    open: boolean
    onClose: () => void
    // The sheet comes to rest open
    onOpened?: () => void
    footer?: ReactNode
    children?: ReactNode
}

// A tall sheet in the screen tree, with no backdrop, that scrolls its content and keeps the
// search row of the screen behind in view
const DetailSheet = (props: DetailSheetProps) => {
    const ref = useRef<GorhomBottomSheet>(null)
    const insets = useSafeAreaInsets()
    const footer = props.footer
    // The actions of the footer can wrap to a second row, so the end of the content clears its height
    const [footerHeight, setFooterHeight] = useState(0)

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
            topInset={insets.top + DETAIL_SHEET_TOP_GAP}
            bottomInset={insets.bottom + BOTTOM_SHEET_INSET}
            style={detailSheetStyle}
            backgroundComponent={BottomSheetBackground}
            handleIndicatorStyle={bottomSheetHandleIndicator}
            footerComponent={
                footer === undefined
                    ? undefined
                    : (footerProps: BottomSheetFooterProps) => (
                          <BottomSheetFooter {...footerProps}>
                              <View
                                  className={detailSheetFooterStyles}
                                  onLayout={event => {
                                      setFooterHeight(event.nativeEvent.layout.height)
                                  }}
                              >
                                  {footer}
                              </View>
                          </BottomSheetFooter>
                      )
            }
            onChange={index => {
                if (index === 0) {
                    props.onOpened?.()
                }
            }}
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
                        : {
                              ...detailSheetContentStyle,
                              paddingBottom:
                                  footerHeight + detailSheetContentStyle.paddingBottom,
                          }
                }
            >
                {props.children}
            </BottomSheetScrollView>
        </GorhomBottomSheet>
    )
}

export { DetailSheet }
