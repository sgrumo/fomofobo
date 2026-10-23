import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Pressable, TextInput, View } from "react-native"

import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { PixelPanel } from "@/components/ui/pixel-panel/pixel-panel"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"

import {
    SEARCH_FIELD_CLEAR_HIT_SLOP,
    SEARCH_FIELD_CLEAR_ICON_SIZE,
    SEARCH_FIELD_ICON_SIZE,
    searchFieldClearStyles,
    searchFieldInputStyles,
    searchFieldStyles,
} from "./search-field.styles"

interface SearchFieldProps {
    label: string
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    onSubmitEditing?: () => void
    onFocus?: () => void
    onBlur?: () => void
    className?: string
}

const SearchField = (props: SearchFieldProps) => {
    const { t } = useTranslation("ui")
    const inputRef = useRef<TextInput>(null)
    const [focused, setFocused] = useState(false)

    return (
        <PixelPanel
            shadow="md"
            ink={focused ? "focus" : "line"}
            className={props.className}
        >
            <View className={searchFieldStyles}>
                <PixelIcon name="search" size={SEARCH_FIELD_ICON_SIZE} />
                <TextInput
                    ref={inputRef}
                    accessibilityLabel={props.label}
                    placeholder={props.placeholder}
                    value={props.value}
                    onChangeText={props.onValueChange}
                    onSubmitEditing={props.onSubmitEditing}
                    onFocus={() => {
                        setFocused(true)
                        props.onFocus?.()
                    }}
                    onBlur={() => {
                        setFocused(false)
                        props.onBlur?.()
                    }}
                    returnKeyType="search"
                    autoCorrect={false}
                    selectionColor={THEME_COLORS.live}
                    cursorColor={THEME_COLORS.live}
                    className={searchFieldInputStyles}
                />
                {props.value !== "" && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("SearchField.Clear")}
                        hitSlop={SEARCH_FIELD_CLEAR_HIT_SLOP}
                        onPress={() => {
                            props.onValueChange("")
                            inputRef.current?.focus()
                        }}
                        className={searchFieldClearStyles}
                    >
                        <PixelIcon name="close" size={SEARCH_FIELD_CLEAR_ICON_SIZE} />
                    </Pressable>
                )}
            </View>
        </PixelPanel>
    )
}

export { SearchField }
