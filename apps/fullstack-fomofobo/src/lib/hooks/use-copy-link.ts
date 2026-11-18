import { useTranslation } from "react-i18next"
import { useToast } from "ui-components/toast"

/**
 * @description Returns a handler that copies a link to the clipboard, and reports the outcome in a toast
 */
export const useCopyLink = () => {
    const { t } = useTranslation("shared")
    const toast = useToast()

    return async (url: string) => {
        try {
            await navigator.clipboard.writeText(url)
            toast.add({ type: "success", messages: [t("Detail.ShareOn.Copied")] })
        } catch {
            toast.add({ type: "error", error: { type: "generic" } })
        }
    }
}
