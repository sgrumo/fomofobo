import type { VariantProps } from "class-variance-authority"
import { View } from "react-native"
import Animated, { useReducedMotion } from "react-native-reanimated"

import { Text } from "@/components/ui/text/text"
import { cn } from "@/lib/utils/class-names"

import {
    badgeDotVariants,
    badgeTextVariants,
    badgeVariants,
    livePulse,
} from "./badge.styles"

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>

interface BadgeProps {
    children: string
    tone?: BadgeTone
    dot?: boolean
    className?: string
}

const Badge = (props: BadgeProps) => {
    const reducedMotion = useReducedMotion()
    const tone = props.tone ?? "neutral"

    return (
        <View className={cn(badgeVariants({ tone }), props.className)}>
            {props.dot === true && (
                <Animated.View
                    style={tone === "live" && !reducedMotion ? livePulse : undefined}
                >
                    <View className={badgeDotVariants({ tone })} />
                </Animated.View>
            )}
            <Text className={badgeTextVariants({ tone })} maxFontSizeMultiplier={1.5}>
                {props.children}
            </Text>
        </View>
    )
}

export { Badge }
