import GorhomBottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet"
import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { View } from "react-native"
import { GestureDetector, usePanGesture } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { BottomSheetBackground } from "@/components/ui/bottom-sheet/bottom-sheet"
import {
    BOTTOM_SHEET_INSET,
    bottomSheetHandleIndicator,
} from "@/components/ui/bottom-sheet/bottom-sheet.styles"

import {
    BOTTOM_SHEET_TAB_ROW_HEIGHT,
    bottomSheetPanelContentStyles,
    bottomSheetPanelStyle,
    bottomSheetTabLayerStyle,
    bottomSheetTabRowStyle,
    bottomSheetTabRowStyles,
    bottomSheetTabTuckStyle,
    DRAG_DOWN_OFFSETS,
    SWIPE_UP_ACTIVE_OFFSETS,
    SWIPE_UP_DISTANCE,
} from "./bottom-sheet-panel.styles"

interface BottomSheetPanelProps {
    open: boolean
    onClose: () => void
    // A tab that peeks out above the sheet
    tab?: ReactNode
    onSwipeUp?: () => void
    children?: ReactNode
}

// A sheet in the screen tree, with no backdrop: the screen behind stays usable, and the content
// gets new props on the same render, unlike `BottomSheet`, which renders through a portal
const BottomSheetPanel = (props: BottomSheetPanelProps) => {
    const ref = useRef<GorhomBottomSheet>(null)
    const insets = useSafeAreaInsets()
    // Top of the sheet frame in the parent, which the tab follows
    const sheetTop = useSharedValue(0)
    const tabRowStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetTop.value - BOTTOM_SHEET_TAB_ROW_HEIGHT }],
    }))
    const onSwipeUp = props.onSwipeUp
    const swipeUp = usePanGesture({
        enabled: onSwipeUp !== undefined,
        // JS-thread callbacks: `onSwipeUp` is no worklet, and the swipe drives no animation
        disableReanimated: true,
        activeOffsetY: SWIPE_UP_ACTIVE_OFFSETS,
        failOffsetY: DRAG_DOWN_OFFSETS,
        onDeactivate: event => {
            if (event.translationY <= -SWIPE_UP_DISTANCE) {
                onSwipeUp?.()
            }
        },
    })

    useEffect(() => {
        if (props.open) {
            ref.current?.snapToIndex(0)
        } else {
            ref.current?.close()
        }
    }, [props.open])

    return (
        <>
            {/* Outside the sheet and under it, so a press beside the tab reaches the screen behind */}
            {props.tab !== undefined && (
                <Animated.View
                    pointerEvents="box-none"
                    style={[bottomSheetTabLayerStyle, tabRowStyle]}
                >
                    <View
                        pointerEvents="box-none"
                        className={bottomSheetTabRowStyles}
                        style={bottomSheetTabRowStyle}
                    >
                        <View style={bottomSheetTabTuckStyle}>{props.tab}</View>
                    </View>
                </Animated.View>
            )}
            <GorhomBottomSheet
                ref={ref}
                index={-1}
                animatedPosition={sheetTop}
                enableDynamicSizing={true}
                // The sheet pans on a drag down alone, so a drag up reaches the swipe of the content
                activeOffsetY={onSwipeUp === undefined ? undefined : DRAG_DOWN_OFFSETS}
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
                    <GestureDetector gesture={swipeUp}>
                        <View className={bottomSheetPanelContentStyles}>
                            {props.children}
                        </View>
                    </GestureDetector>
                </BottomSheetView>
            </GorhomBottomSheet>
        </>
    )
}

export { BottomSheetPanel }
