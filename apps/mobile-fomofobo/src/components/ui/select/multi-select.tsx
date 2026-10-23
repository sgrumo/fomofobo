import type { BottomSheetModal } from "@gorhom/bottom-sheet"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { BottomSheet } from "@/components/ui/bottom-sheet/bottom-sheet"

import type { Option } from "./select"
import { SelectOption } from "./select-option"
import { SelectTrigger } from "./select-trigger"

interface MultiSelectProps {
    label: string
    value: readonly Option[]
    onValueChange: (options: readonly Option[]) => void
    options: readonly Option[]
    placeholder?: string
    title?: string
    disabled?: boolean
    className?: string
}

const MultiSelect = (props: MultiSelectProps) => {
    const { t } = useTranslation("ui")
    const sheetRef = useRef<BottomSheetModal>(null)
    const [isOpen, setIsOpen] = useState(false)

    const isSelected = (option: Option) =>
        props.value.some(item => item.value === option.value)

    return (
        <>
            <SelectTrigger
                label={props.label}
                value={
                    props.value.length === 0
                        ? undefined
                        : props.value.map(item => item.label).join(", ")
                }
                placeholder={props.placeholder ?? t("Select.Placeholder")}
                expanded={isOpen}
                disabled={props.disabled}
                onPress={() => {
                    setIsOpen(true)
                    sheetRef.current?.present()
                }}
                className={props.className}
            />
            <BottomSheet
                ref={sheetRef}
                title={props.title ?? t("Select.Title")}
                onDismiss={() => {
                    setIsOpen(false)
                }}
            >
                {props.options.map(option => (
                    <SelectOption
                        key={option.value}
                        label={option.label}
                        selected={isSelected(option)}
                        onPress={() => {
                            props.onValueChange(
                                isSelected(option)
                                    ? props.value.filter(
                                          item => item.value !== option.value,
                                      )
                                    : [...props.value, option],
                            )
                        }}
                    />
                ))}
            </BottomSheet>
        </>
    )
}

export { MultiSelect }
