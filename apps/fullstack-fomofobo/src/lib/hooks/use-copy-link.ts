import { useToast } from "ui-components/toast"

/**
 * @description Returns a handler that copies a link to the clipboard, and reports a failure in a toast
 */
export const useCopyLink = () => {
    const toast = useToast()

    return async (url: string) => {
        try {
            await navigator.clipboard.writeText(url)
        } catch {
            toast.add({ type: "error", error: { type: "generic" } })
        }
    }
}
