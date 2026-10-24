import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "@/components/ui/button/button"
import { Notice } from "@/components/ui/notice/notice"
import type { NoticeTone } from "@/components/ui/notice/notice"
import { Text } from "@/components/ui/text/text"

interface ScreenNoticeProps {
    tone: NoticeTone
    message: string
    action?: { label: string; onPress: () => void }
}

export const ScreenNotice = (props: ScreenNoticeProps) => {
    const insets = useSafeAreaInsets()
    const action = props.action

    return (
        <View
            className="flex-1 justify-center gap-4 bg-surface px-4"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            <Notice tone={props.tone} lines={[props.message]} />
            {action !== undefined && (
                <Button
                    accessibilityLabel={action.label}
                    onPress={() => {
                        action.onPress()
                    }}
                >
                    <Text>{action.label}</Text>
                </Button>
            )}
        </View>
    )
}
