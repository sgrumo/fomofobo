import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react-native"
import { View } from "react-native"
import { match } from "ts-pattern"

import { Spinner } from "@/components/ui/spinner/spinner"
import { Text } from "@/components/ui/text/text"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"
import { cn } from "@/lib/utils/class-names"

import {
    NOTICE_ICON_SIZE,
    noticeIconColors,
    noticeLineStyles,
    noticeTextListStyles,
    noticeVariants,
} from "./notice.styles"

type NoticeTone = keyof typeof noticeIconColors

interface NoticeProps {
    tone: NoticeTone
    lines: readonly string[]
    className?: string
}

const Notice = (props: NoticeProps) => {
    const iconProps = {
        size: NOTICE_ICON_SIZE,
        color: THEME_COLORS[noticeIconColors[props.tone]],
    }
    const icon = match(props.tone)
        .with("loading", () => (
            <Spinner
                label={props.lines.join(" ")}
                size="sm"
                color={noticeIconColors.loading}
            />
        ))
        .with("info", () => <Info {...iconProps} />)
        .with("success", () => <CircleCheck {...iconProps} />)
        .with("warning", () => <TriangleAlert {...iconProps} />)
        .with("error", () => <CircleAlert {...iconProps} />)
        .exhaustive()
    const urgent = props.tone === "error" || props.tone === "warning"

    return (
        <View
            accessibilityRole={urgent ? "alert" : "summary"}
            accessibilityLiveRegion={urgent ? "assertive" : "polite"}
            className={cn(noticeVariants({ tone: props.tone }), props.className)}
        >
            {icon}
            <View className={noticeTextListStyles}>
                {props.lines.map(line => (
                    <Text key={line} className={noticeLineStyles}>
                        {line}
                    </Text>
                ))}
            </View>
        </View>
    )
}

export { Notice }
export type { NoticeTone }
