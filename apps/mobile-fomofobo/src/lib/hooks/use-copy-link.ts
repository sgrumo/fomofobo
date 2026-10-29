import { setStringAsync } from "expo-clipboard"
import { useTranslation } from "react-i18next"

import { toastError } from "@/components/ui/toast/toast"

/**
 * @description Returns a handler that copies a link to the clipboard, and reports a failure in a toast
 */
export const useCopyLink = () => {
    const { t } = useTranslation("shared")

    return async (url: string) => {
        const copied = await setStringAsync(url).catch(() => false)
        if (!copied) {
            toastError(t("Detail.CopyFailed"))
        }
    }
}
