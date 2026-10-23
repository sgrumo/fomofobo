import { View } from "react-native"
import type { ViewProps } from "react-native"

import { Text, TextClassContext } from "@/components/ui/text/text"
import { cn } from "@/lib/utils/class-names"

import {
    cardContentStyles,
    cardDescriptionStyles,
    cardFooterStyles,
    cardHeaderStyles,
    cardStyles,
    cardTitleStyles,
} from "./card.styles"

const Card = ({ className, ...props }: ViewProps & React.RefAttributes<View>) => (
    <TextClassContext.Provider value="text-card-foreground">
        <View className={cn(cardStyles, className)} {...props} />
    </TextClassContext.Provider>
)

const CardHeader = ({ className, ...props }: ViewProps & React.RefAttributes<View>) => (
    <View className={cn(cardHeaderStyles, className)} {...props} />
)

const CardTitle = ({
    className,
    ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) => (
    <Text
        role="heading"
        aria-level={3}
        className={cn(cardTitleStyles, className)}
        {...props}
    />
)

const CardDescription = ({
    className,
    ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) => (
    <Text className={cn(cardDescriptionStyles, className)} {...props} />
)

const CardContent = ({ className, ...props }: ViewProps & React.RefAttributes<View>) => (
    <View className={cn(cardContentStyles, className)} {...props} />
)

const CardFooter = ({ className, ...props }: ViewProps & React.RefAttributes<View>) => (
    <View className={cn(cardFooterStyles, className)} {...props} />
)

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
