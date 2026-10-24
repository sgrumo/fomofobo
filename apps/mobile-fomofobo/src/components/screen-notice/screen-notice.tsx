import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "@/components/ui/button/button"
import { Notice } from "@/components/ui/notice/notice"
import type { NoticeTone } from "@/components/ui/notice/notice"
import { Text } from "@/components/ui/text/text"

interface ScreenNoticeAction {
    label: string
    onPress: () => void
}

interface ScreenNoticeProps {
    tone: NoticeTone
    message: string
    actions?: readonly ScreenNoticeAction[]
}

export const ScreenNotice = (props: ScreenNoticeProps) => {
    const insets = useSafeAreaInsets()

    return (
        <View
            className="flex-1 justify-center gap-4 bg-surface px-4"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            <Notice tone={props.tone} lines={[props.message]} />
            {props.actions?.map((action, index) => (
                <Button
                    key={action.label}
                    variant={index === 0 ? "primary" : "secondary"}
                    accessibilityLabel={action.label}
                    onPress={() => {
                        action.onPress()
                    }}
                >
                    <Text>{action.label}</Text>
                </Button>
            ))}
        </View>
    )
}
