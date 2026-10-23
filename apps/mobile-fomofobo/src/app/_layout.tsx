import "@/lib/env"
import "@/lib/api/app-focus"
import "../global.css"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ErrorBoundaryProps } from "expo-router"
import { Stack } from "expo-router"
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen"
import type { PropsWithChildren } from "react"
import { Suspense, use } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { lazyAsync } from "shared/function"

import { Button } from "@/components/ui/button/button"
import { Text } from "@/components/ui/text/text"
import { VersionGate } from "@/components/version-gate/version-gate"
import { nativeI18n } from "@/lib/i18n/native-i18n"

void preventAutoHideAsync()

const queryClient = new QueryClient()

// One stable promise for `use()`. A rejected one is dropped, so a retry starts a new init.
const appReady = lazyAsync(() =>
    nativeI18n.init().finally(() => {
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
            className="bg-background flex-1 items-center justify-center gap-4 px-6"
        >
            <Text
                accessibilityRole="header"
                className="text-center text-2xl font-semibold"
            >
                {copy.title}
            </Text>
            <Text
                accessibilityLiveRegion="polite"
                className="text-muted-foreground text-center text-base"
            >
                {copy.message}
            </Text>
            <Button
                accessibilityLabel={copy.retry}
                className="w-full"
                onPress={() => {
                    void props.retry()
                }}
                size="lg"
            >
                <Text>{copy.retry}</Text>
            </Button>
        </View>
    )
}

const RootLayout = () => (
    <GestureHandlerRootView className="flex-1">
        <Suspense fallback={null}>
            <AppReadyGate>
                <QueryClientProvider client={queryClient}>
                    <VersionGate>
                        <BottomSheetModalProvider>
                            <Stack>
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
                </QueryClientProvider>
            </AppReadyGate>
        </Suspense>
    </GestureHandlerRootView>
)

export default RootLayout
