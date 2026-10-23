import { useSyncExternalStore } from "react"
import { useTranslation } from "react-i18next"
import { Pressable, View } from "react-native"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Notice } from "@/components/ui/notice/notice"
import { hardShadow } from "@/lib/theme/hard-shadow"

import { dismissToast, readToasts, subscribeToasts } from "./toast-store"
import { TOAST_GAP, toastHostStyles, toastItemStyles } from "./toast.styles"

const ToastHost = () => {
    const { t } = useTranslation("ui")
    const toasts = useSyncExternalStore(subscribeToasts, readToasts)
    const insets = useSafeAreaInsets()

    return (
        <View className={toastHostStyles} style={{ bottom: insets.bottom + TOAST_GAP }}>
            {toasts.map(toast => (
                <Animated.View key={toast.id} entering={FadeInDown} exiting={FadeOutDown}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityHint={t("Toast.DismissHint")}
                        onPress={() => {
                            dismissToast(toast.id)
                        }}
                        className={toastItemStyles}
                        style={hardShadow("md")}
                    >
                        <Notice
                            tone={toast.tone}
                            lines={[toast.title, toast.message].filter(
                                line => line !== undefined,
                            )}
                        />
                    </Pressable>
                </Animated.View>
            ))}
        </View>
    )
}

export { ToastHost }
