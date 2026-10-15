import { Button } from "ui-components/button"
import { useToast } from "ui-components/toast"

export const ToastSamples = () => {
    const toast = useToast()

    return (
        <div className="flex flex-wrap gap-4">
            <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => {
                    toast.add({
                        type: "success",
                        messages: ["Toast success description"],
                    })
                }}
            >
                Fire success toast
            </Button>
            <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => {
                    toast.add({
                        type: "warning",
                        messages: ["Toast warning description"],
                    })
                }}
            >
                Fire warning toast
            </Button>
            <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => {
                    toast.add({
                        type: "error",
                        error: { type: "generic", messages: ["Toast error description"] },
                    })
                }}
            >
                Fire error toast
            </Button>
            <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => {
                    toast.add({
                        type: "info",
                        title: "Sample info toast",
                        messages: ["Toast info description"],
                    })
                }}
            >
                Fire info toast
            </Button>
        </div>
    )
}
