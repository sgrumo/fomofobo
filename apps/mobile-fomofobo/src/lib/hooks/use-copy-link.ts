import { setStringAsync } from "expo-clipboard"
import { useTranslation } from "react-i18next"

import { toastError, toastSuccess } from "@/components/ui/toast/toast"

/**
 * @description Returns a handler that copies a link to the clipboard and reports the result in a toast
 */
export const useCopyLink = () => {
    const { t } = useTranslation("shared")

    return async (url: string) => {
        const copied = await setStringAsync(url).catch(() => false)
        if (copied) {
            toastSuccess(t("Detail.LinkCopied"))
            return
        }
        toastError(t("Detail.CopyFailed"))
    }
}
