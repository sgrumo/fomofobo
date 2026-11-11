import GorhomBottomSheet, {
    BottomSheetHandle,
    BottomSheetView,
} from "@gorhom/bottom-sheet"
import type {
    BottomSheetBackgroundProps,
    BottomSheetHandleProps,
} from "@gorhom/bottom-sheet"
import { createContext, use, useEffect, useRef } from "react"
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
    bottomSheetTabbedBackgroundStyle,
    bottomSheetTabRowStyle,
    bottomSheetTabRowStyles,
} from "./bottom-sheet-panel.styles"

// gorhom takes the handle as a component: the tab goes through context, so the handle keeps
// its identity across renders
const TabContext = createContext<ReactNode>(undefined)

// The tab sits in the handle, above the frame, so the frame line runs under it
const TabbedHandle = (props: BottomSheetHandleProps) => {
    const tab = use(TabContext)

    return (
        <View>
            <View className={bottomSheetTabRowStyles} style={bottomSheetTabRowStyle}>
                {tab}
            </View>
            <BottomSheetHandle {...props} indicatorStyle={bottomSheetHandleIndicator} />
        </View>
    )
}

const TabbedBackground = (props: BottomSheetBackgroundProps) => (
    <BottomSheetBackground
        {...props}
        style={[props.style, bottomSheetTabbedBackgroundStyle]}
    />
)

interface BottomSheetPanelProps {
    open: boolean
    onClose: () => void
    // A tab that peeks out above the sheet
    tab?: ReactNode
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
        <TabContext value={props.tab}>
            <GorhomBottomSheet
                ref={ref}
                index={-1}
                enableDynamicSizing={true}
                enablePanDownToClose={true}
                detached={true}
                bottomInset={insets.bottom + BOTTOM_SHEET_INSET}
                style={bottomSheetPanelStyle}
                backgroundComponent={
                    props.tab === undefined ? BottomSheetBackground : TabbedBackground
                }
                handleComponent={props.tab === undefined ? undefined : TabbedHandle}
                handleIndicatorStyle={bottomSheetHandleIndicator}
                onClose={() => {
                    // A close that `open` asked for is no close of the user
                    if (props.open) {
                        props.onClose()
                    }
                }}
            >
                <BottomSheetView>
                    <View className={bottomSheetPanelContentStyles}>
                        {props.children}
                    </View>
                </BottomSheetView>
            </GorhomBottomSheet>
        </TabContext>
    )
}

export { BottomSheetPanel }
