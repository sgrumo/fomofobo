import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Pressable, TextInput, View } from "react-native"
import Animated from "react-native-reanimated"

import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { PixelPanel } from "@/components/ui/pixel-panel/pixel-panel"
import { Text } from "@/components/ui/text/text"
import { COMPACT_MAX_FONT_SCALE } from "@/lib/theme/font-scale"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"

import {
    SEARCH_FIELD_CLEAR_HIT_SLOP,
    SEARCH_FIELD_CLEAR_ICON_SIZE,
    SEARCH_FIELD_ICON_SIZE,
    searchFieldClearStyles,
    searchFieldCursorStyle,
    searchFieldInputContainerStyles,
    searchFieldInputStyles,
    searchFieldPlaceholderStyles,
    searchFieldPlaceholderTextStyles,
    searchFieldStyles,
} from "./search-field.styles"

interface SearchFieldProps {
    label: string
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    // Receives the text of the field: the change of the last letters can reach the parent after it
    onSubmitEditing?: (text: string) => void
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
                <View className={searchFieldInputContainerStyles}>
                    <TextInput
                        ref={inputRef}
                        accessibilityLabel={props.label}
                        accessibilityHint={props.placeholder}
                        value={props.value}
                        onChangeText={props.onValueChange}
                        onSubmitEditing={event => {
                            props.onSubmitEditing?.(event.nativeEvent.text)
                        }}
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
                        maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
                        className={searchFieldInputStyles}
                    />
                    {/* The placeholder of the web field, drawn in place of the native one */}
                    {props.value === "" && (
                        <View
                            pointerEvents="none"
                            className={searchFieldPlaceholderStyles}
                        >
                            <Text
                                variant="pixel-md"
                                numberOfLines={1}
                                maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
                                className={searchFieldPlaceholderTextStyles}
                            >
                                {props.placeholder}
                            </Text>
                            {!focused && <Animated.View style={searchFieldCursorStyle} />}
                        </View>
                    )}
                </View>
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
