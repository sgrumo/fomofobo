import type { BottomSheetModal } from "@gorhom/bottom-sheet"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { BottomSheet } from "@/components/ui/bottom-sheet/bottom-sheet"

import { SelectOption } from "./select-option"
import { SelectTrigger } from "./select-trigger"

interface Option {
    label: string
    value: string
}

interface SelectProps {
    label: string
    value: Option | undefined
    onValueChange: (option: Option) => void
    options: readonly Option[]
    placeholder?: string
    title?: string
    disabled?: boolean
    className?: string
}

const Select = (props: SelectProps) => {
    const { t } = useTranslation("ui")
    const sheetRef = useRef<BottomSheetModal>(null)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <SelectTrigger
                label={props.label}
                value={props.value?.label}
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
                        selected={props.value?.value === option.value}
                        onPress={() => {
                            props.onValueChange(option)
                            sheetRef.current?.dismiss()
                        }}
                    />
                ))}
            </BottomSheet>
        </>
    )
}

export { Select }
export type { Option }
