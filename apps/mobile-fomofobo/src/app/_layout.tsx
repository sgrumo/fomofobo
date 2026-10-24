// Built-ins that the repo code style relies on and that Hermes lacks
import "core-js/actual/array/to-sorted"
import "core-js/actual/map/group-by"
import "core-js/actual/object/group-by"
import "@/lib/env"
import "@/lib/api/app-focus"
import "../global.css"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ErrorBoundaryProps } from "expo-router"
import { Stack } from "expo-router"
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import type { ComponentProps, PropsWithChildren } from "react"
import { Suspense, use } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { lazyAsync } from "shared/function"

import { Button } from "@/components/ui/button/button"
import { Text } from "@/components/ui/text/text"
import { ToastHost } from "@/components/ui/toast/toast-host"
import { VersionGate } from "@/components/version-gate/version-gate"
import { nativeI18n } from "@/lib/i18n/native-i18n"
import { startDeviceSaveSync } from "@/lib/saves/device-save-sync"
import { hydrateDeviceStorage } from "@/lib/storage/device-storage"
import { FONT_FAMILIES, THEME_COLORS } from "@/lib/theme/theme-tokens"

void preventAutoHideAsync()

const queryClient = new QueryClient()

// One stable promise for `use()`. A rejected one is dropped, so a retry starts a new init.
// The device storage reads from memory, so it loads before the first screen.
// Its own lazy promise starts the save sync once, even when the i18n init is retried.
const deviceStorageReady = lazyAsync(() =>
    hydrateDeviceStorage().then(startDeviceSaveSync),
)

const appReady = lazyAsync(() =>
    Promise.all([nativeI18n.init(), deviceStorageReady()]).finally(() => {
        void hideAsync()
    }),
)

const AppReadyGate = (props: PropsWithChildren) => {
    use(appReady())
    return props.children
}

// Copy for an error before the i18n init completes. Mirrors `shared:AppError`.
const appErrorFallback = {
    title: "Qualcosa è andato storto",
    message: "Un errore ha bloccato l'app. Riprova.",
    retry: "Riprova",
}

export const ErrorBoundary = (props: ErrorBoundaryProps) => {
    const { t, ready } = useTranslation("shared", { useSuspense: false })

    const copy = ready
        ? {
              title: t("AppError.Title"),
              message: t("AppError.Message"),
              retry: t("AppError.Retry"),
          }
        : appErrorFallback

    return (
        <View
            accessibilityRole="alert"
            className="flex-1 items-center justify-center gap-4 bg-surface px-6"
        >
            <Text accessibilityRole="header" variant="pixel-xl" className="text-center">
                {copy.title}
            </Text>
            <Text accessibilityLiveRegion="polite" className="text-center text-fg-muted">
                {copy.message}
            </Text>
            <Button
                accessibilityLabel={copy.retry}
                className="w-full"
                onPress={() => {
                    void props.retry()
                }}
            >
                <Text>{copy.retry}</Text>
            </Button>
        </View>
    )
}

const stackScreenOptions: ComponentProps<typeof Stack>["screenOptions"] = {
    headerStyle: { backgroundColor: THEME_COLORS.surface },
    headerTintColor: THEME_COLORS.fg,
    headerTitleStyle: { fontFamily: FONT_FAMILIES.display, fontWeight: "700" },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: "minimal",
    contentStyle: { backgroundColor: THEME_COLORS.surface },
}

const RootLayout = () => (
    <GestureHandlerRootView className="flex-1">
        {/* oxlint-disable-next-line react/style-prop-object -- `style` names the bar text color */}
        <StatusBar style="dark" />
        <Suspense fallback={null}>
            <AppReadyGate>
                <QueryClientProvider client={queryClient}>
                    <VersionGate>
                        <BottomSheetModalProvider>
                            <Stack screenOptions={stackScreenOptions}>
                                <Stack.Screen
                                    name="index"
                                    options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                    name="showcase"
                                    options={{ title: "Showcase" }}
                                />
                            </Stack>
                        </BottomSheetModalProvider>
                    </VersionGate>
                    <ToastHost />
                </QueryClientProvider>
            </AppReadyGate>
        </Suspense>
    </GestureHandlerRootView>
)

export default RootLayout
