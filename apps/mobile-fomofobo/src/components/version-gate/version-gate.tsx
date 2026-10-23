import { useQuery } from "@tanstack/react-query"
import { openURL } from "expo-linking"
import type { PropsWithChildren } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

import { Button } from "@/components/ui/button/button"
import { Text } from "@/components/ui/text/text"
import { api } from "@/lib/api/client"

import { isVersionGateBlocking, resolveVersionGateScreen } from "./version-gate-state"

/** Keeps a blocked app checking, so the screen clears itself when the block ends. */
const BLOCKED_POLL_MS = 20_000

interface GateMessageProps {
    title: string
    message: string
    actionLabel: string
    onAction: () => void
}

const BlockedScreen = (props: GateMessageProps) => (
    <View
        accessibilityRole="alert"
        className="bg-background flex-1 items-center justify-center gap-4 px-6"
    >
        <Text accessibilityRole="header" className="text-center text-2xl font-semibold">
            {props.title}
        </Text>
        <Text
            accessibilityLiveRegion="polite"
            className="text-muted-foreground text-center text-base"
        >
            {props.message}
        </Text>
        <Button
            accessibilityLabel={props.actionLabel}
            className="w-full"
            onPress={props.onAction}
            size="lg"
        >
            <Text>{props.actionLabel}</Text>
        </Button>
    </View>
)

interface UpdatePopupProps {
    onAction: () => void
    onDismiss: () => void
}

// Centered over a scrim, because the gate wraps the whole navigator and cannot
// know the height of a tab bar or of the safe area below it.
const UpdatePopup = (props: UpdatePopupProps) => {
    const { t } = useTranslation("version-gate")

    return (
        <View className="absolute inset-0 items-center justify-center bg-black/50 p-6">
            <View className="bg-card border-border w-full gap-3 rounded-lg border p-4 shadow-lg">
                <Text accessibilityRole="header" className="text-base font-semibold">
                    {t("UpdateOptional.Title")}
                </Text>
                <Text className="text-muted-foreground text-sm">
                    {t("UpdateOptional.Message")}
                </Text>
                <View className="flex-row gap-2">
                    <Button
                        accessibilityLabel={t("UpdateOptional.DismissLabel")}
                        className="flex-1"
                        onPress={props.onDismiss}
                        size="lg"
                        variant="outline"
                    >
                        <Text>{t("UpdateOptional.Dismiss")}</Text>
                    </Button>
                    <Button
                        accessibilityLabel={t("UpdateOptional.Action")}
                        className="flex-1"
                        onPress={props.onAction}
                        size="lg"
                    >
                        <Text>{t("UpdateOptional.Action")}</Text>
                    </Button>
                </View>
            </View>
        </View>
    )
}

/**
 * @description Shows the version gate screen over the app, or the app itself
 * @remarks Holds the dismissal of the optional popup for the session only, so the popup
 * returns on the next launch
 */
export const VersionGate = (props: PropsWithChildren) => {
    const { t } = useTranslation("version-gate")
    const [dismissed, setDismissed] = useState(false)

    const { data: compatibility, refetch: recheck } = useQuery({
        ...api.checkClientCompatibilityQuery({ params: {}, query: {} }),
        refetchInterval: query =>
            isVersionGateBlocking(query.state.data) ? BLOCKED_POLL_MS : false,
    })

    const screen = resolveVersionGateScreen(compatibility)

    const onRecheck = () => {
        void recheck()
    }

    const openStore = (storeUrl: string) => () => {
        void openURL(storeUrl)
    }

    if (screen.kind === "blocked") {
        const blocked = screen.reason === "maintenance" ? "Maintenance" : "UpdateRequired"

        // A blocked screen with no store URL leaves the user no exit, so it
        // offers a retry instead. See the resolver: only `update-required`
        // carries a URL, and the backend never sends it without one.
        return screen.storeUrl === undefined ? (
            <BlockedScreen
                actionLabel={t("Retry")}
                message={t(`${blocked}.Message`)}
                onAction={onRecheck}
                title={t(`${blocked}.Title`)}
            />
        ) : (
            <BlockedScreen
                actionLabel={t(`${blocked}.Action`)}
                message={t(`${blocked}.Message`)}
                onAction={openStore(screen.storeUrl)}
                title={t(`${blocked}.Title`)}
            />
        )
    }

    const onDismiss = () => {
        setDismissed(true)
    }

    return (
        <>
            {props.children}
            {screen.kind === "popup" && !dismissed && screen.storeUrl !== undefined ? (
                <UpdatePopup
                    onAction={openStore(screen.storeUrl)}
                    onDismiss={onDismiss}
                />
            ) : null}
        </>
    )
}
