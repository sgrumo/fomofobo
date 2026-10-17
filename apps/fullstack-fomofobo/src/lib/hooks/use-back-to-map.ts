import { useRouter } from "next/navigation"
import { useLanguage } from "react-i18n/hooks"

import { routes } from "@/framework/routes/routes"
import { hasInAppHistory } from "@/lib/navigation/in-app-history"

/**
 * @description Returns a handler that goes back to the previous page of the app, or opens
 * the map when the page came from outside, such as a shared link
 */
export const useBackToMap = () => {
    const router = useRouter()
    const language = useLanguage()

    return () => {
        if (hasInAppHistory()) {
            router.back()
            return
        }
        router.push(routes.root.path({ parameters: { lang: language }, query: {} }))
    }
}
