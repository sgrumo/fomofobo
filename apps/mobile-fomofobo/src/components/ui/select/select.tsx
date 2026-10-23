import type { BottomSheetModal } from "@gorhom/bottom-sheet"
import { BottomSheetFlatList, BottomSheetModal as BSModal } from "@gorhom/bottom-sheet"
import { ChevronDown } from "lucide-react-native"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Pressable, View } from "react-native"

import { Icon } from "@/components/ui/icon/icon"
import { Text } from "@/components/ui/text/text"
import { cn } from "@/lib/utils/class-names"

import {
    selectCheckStyles,
    selectChevronStyles,
    selectHeaderDoneStyles,
    selectHeaderStyles,
    selectHeaderTitleStyles,
    selectItemActiveStyles,
    selectItemStyles,
    selectItemTextStyles,
    selectPlaceholderStyles,
    selectTriggerSmStyles,
    selectTriggerStyles,
    selectValueStyles,
} from "./select.styles"

interface Option {
    label: string
    value: string
}

interface SelectProps {
    value: Option | undefined
    onValueChange: (option: Option) => void
    options: readonly Option[]
    placeholder?: string
    title?: string
    size?: "default" | "sm"
    disabled?: boolean
    className?: string
    accessibilityLabel?: string
}

const Select = (props: SelectProps) => {
    const { t } = useTranslation("ui")
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const [isOpen, setIsOpen] = useState(false)

    const onOpen = () => {
        setIsOpen(true)
        bottomSheetRef.current?.present()
    }

    const onDismiss = () => {
        setIsOpen(false)
    }

    const onSelect = (option: Option) => {
        props.onValueChange(option)
        bottomSheetRef.current?.dismiss()
    }

    return (
        <>
            <Pressable
                role="combobox"
                aria-expanded={isOpen}
                accessibilityLabel={props.accessibilityLabel}
                disabled={props.disabled}
                onPress={onOpen}
                className={cn(
                    selectTriggerStyles,
                    props.size === "sm" && selectTriggerSmStyles,
                    props.disabled && "opacity-50",
                    props.className,
                )}
            >
                {props.value ? (
                    <Text className={selectValueStyles}>{props.value.label}</Text>
                ) : (
                    <Text className={selectPlaceholderStyles}>
                        {props.placeholder ?? t("Select.Placeholder")}
                    </Text>
                )}
                <Icon
                    as={ChevronDown}
                    aria-hidden={true}
                    className={selectChevronStyles}
                />
            </Pressable>

            <BSModal
                ref={bottomSheetRef}
                onDismiss={onDismiss}
                enableDynamicSizing={true}
                enablePanDownToClose={true}
            >
                <View className={selectHeaderStyles}>
                    <Text className={selectHeaderTitleStyles}>
                        {props.title ?? t("Select.Title")}
                    </Text>
                    <Pressable
                        onPress={() => {
                            bottomSheetRef.current?.dismiss()
                        }}
                        accessibilityLabel={t("Select.Close")}
                        accessibilityRole="button"
                        hitSlop={8}
                    >
                        <Text className={selectHeaderDoneStyles}>{t("Select.Done")}</Text>
                    </Pressable>
                </View>
                <BottomSheetFlatList<Option>
                    data={props.options}
                    keyExtractor={(item: Option) => item.value}
                    renderItem={(info: { item: Option }) => {
                        const selected = props.value?.value === info.item.value
                        return (
                            <Pressable
                                role="option"
                                aria-selected={selected}
                                accessibilityLabel={info.item.label}
                                onPress={() => {
                                    onSelect(info.item)
                                }}
                                className={cn(
                                    selectItemStyles,
                                    selected && selectItemActiveStyles,
                                )}
                            >
                                <Text className={selectItemTextStyles}>
                                    {info.item.label}
                                </Text>
                                {selected && <Text className={selectCheckStyles}>✓</Text>}
                            </Pressable>
                        )
                    }}
                />
            </BSModal>
        </>
    )
}

export { Select }
export type { Option }
