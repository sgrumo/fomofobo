import { useQuery } from "@tanstack/react-query"
import { Link } from "expo-router"
import { useTranslation } from "react-i18next"
import { FlatList, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Button } from "@/components/ui/button/button"
import { Text } from "@/components/ui/text/text"
import { api } from "@/lib/api/client"

const HomeScreen = () => {
    const { t } = useTranslation("shared")
    const {
        data: categories,
        isLoading: categoriesLoading,
        isError: categoriesError,
    } = useQuery(api.listCategoriesQuery({ params: {}, query: {} }))

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 gap-4 px-4 pt-4">
                <Text className="text-2xl font-bold" accessibilityRole="header">
                    {t("Categories.Title")}
                </Text>

                {categoriesLoading && (
                    <Text className="text-muted-foreground">
                        {t("Categories.Loading")}
                    </Text>
                )}

                {categoriesError && (
                    <Text className="text-destructive" accessibilityLiveRegion="polite">
                        {t("Categories.Error")}
                    </Text>
                )}

                {categories !== undefined && (
                    <FlatList
                        data={categories}
                        keyExtractor={category => category.id}
                        renderItem={info => <Text>{info.item.name}</Text>}
                        contentContainerClassName="gap-2 pb-4"
                    />
                )}

                {__DEV__ && (
                    <Link href="/showcase" asChild={true}>
                        <Button variant="outline" accessibilityLabel="Open the showcase">
                            <Text>Showcase</Text>
                        </Button>
                    </Link>
                )}
            </View>
        </SafeAreaView>
    )
}

export default HomeScreen
