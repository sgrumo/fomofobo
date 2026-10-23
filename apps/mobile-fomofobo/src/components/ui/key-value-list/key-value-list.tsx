import { View } from "react-native"

import { Text } from "@/components/ui/text/text"
import { cn } from "@/lib/utils/class-names"

import {
    keyValueLabelStyles,
    keyValueListStyles,
    keyValueRowVariants,
    keyValueValueStyles,
} from "./key-value-list.styles"

interface KeyValueItem {
    key: string
    label: string
    value: string
}

interface KeyValueListProps {
    items: readonly KeyValueItem[]
    className?: string
}

const KeyValueList = (props: KeyValueListProps) => (
    <View className={cn(keyValueListStyles, props.className)}>
        {props.items.map((item, index) => (
            <View
                key={item.key}
                accessible={true}
                accessibilityLabel={`${item.label}: ${item.value}`}
                className={keyValueRowVariants({ first: index === 0 })}
            >
                <Text className={keyValueLabelStyles}>{item.label}</Text>
                <Text className={keyValueValueStyles}>{item.value}</Text>
            </View>
        ))}
    </View>
)

export { KeyValueList }
