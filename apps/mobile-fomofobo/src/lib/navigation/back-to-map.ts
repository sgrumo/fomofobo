import { router } from "expo-router"

/**
 * @description Goes back to the previous screen, or opens the map when the screen came from
 * outside the app, such as a shared link
 */
export const backToMap = () => {
    if (router.canGoBack()) {
        router.back()
        return
    }
    router.replace("/")
}
