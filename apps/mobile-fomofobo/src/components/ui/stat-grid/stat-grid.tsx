import { View } from "react-native"

import { Text } from "@/components/ui/text/text"
import { cn } from "@/lib/utils/class-names"

import {
    statGridCellVariants,
    statGridLabelStyles,
    statGridStyles,
    statGridValueStyles,
} from "./stat-grid.styles"

interface StatGridItem {
    label: string
    value: string
}

interface StatGridProps {
    items: readonly StatGridItem[]
    className?: string
}

const StatGrid = (props: StatGridProps) => (
    <View className={cn(statGridStyles, props.className)}>
        {props.items.map((item, index) => {
            const lastAlone = index === props.items.length - 1 && index % 2 === 0
            const column = lastAlone ? "full" : index % 2 === 0 ? "left" : "right"
            return (
                <View
                    key={item.label}
                    accessible={true}
                    accessibilityLabel={`${item.label}: ${item.value}`}
                    className={statGridCellVariants({ column, firstRow: index < 2 })}
                >
                    <Text className={statGridLabelStyles}>{item.label}</Text>
                    <Text className={statGridValueStyles}>{item.value}</Text>
                </View>
            )
        })}
    </View>
)

export { StatGrid }
