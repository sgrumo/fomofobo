import { useState } from "react"
import { Pressable, View } from "react-native"

import { Text } from "@/components/ui/text/text"
import { cn } from "@/lib/utils/class-names"

import {
    tabContentStyles,
    tabListStyles,
    tabTriggerActiveStyles,
    tabTriggerStyles,
    tabTriggerTextActiveStyles,
    tabTriggerTextStyles,
    tabsContainerStyles,
} from "./tabs.styles"

interface TabItem {
    value: string
    label: string
    content: React.ReactNode
}

interface TabsProps {
    items: readonly TabItem[]
    defaultValue?: string
    className?: string
    accessibilityLabel?: string
}

const SegmentedTabs = (props: TabsProps) => {
    const [activeTab, setActiveTab] = useState(
        props.defaultValue ?? props.items[0]?.value ?? "",
    )

    const activeContent = props.items.find(item => item.value === activeTab)?.content

    return (
        <View className={cn(tabsContainerStyles, props.className)}>
            <View accessibilityLabel={props.accessibilityLabel} className={tabListStyles}>
                {props.items.map(item => {
                    const active = activeTab === item.value
                    return (
                        <Pressable
                            key={item.value}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            accessibilityLabel={item.label}
                            onPress={() => {
                                setActiveTab(item.value)
                            }}
                            className={cn(
                                tabTriggerStyles,
                                active && tabTriggerActiveStyles,
                            )}
                        >
                            <Text
                                className={cn(
                                    tabTriggerTextStyles,
                                    active && tabTriggerTextActiveStyles,
                                )}
                            >
                                {item.label}
                            </Text>
                        </Pressable>
                    )
                })}
            </View>
            <View className={tabContentStyles}>{activeContent}</View>
        </View>
    )
}

export { SegmentedTabs }
export type { TabItem }
