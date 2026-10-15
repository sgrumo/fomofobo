import { useState } from "react"
import {
    AlertConfirmationDialog,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "ui-components/alert-dialog"
import { Button } from "ui-components/button"

export const AlertDialogSamples = () => {
    const [confirmOutcome, setConfirmOutcome] = useState<"none" | "confirmed">("none")
    const [deleteOutcome, setDeleteOutcome] = useState<"none" | "deleted">("none")

    return (
        <div className="flex flex-col items-start gap-4">
            <AlertDialog>
                <AlertDialogTrigger
                    render={
                        <Button variant="secondary" size="md" type="button">
                            Open plain alert dialog
                        </Button>
                    }
                />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Plain alert dialog</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <AlertDialogDescription>
                            Plain alert dialog description
                        </AlertDialogDescription>
                    </AlertDialogBody>
                </AlertDialogContent>
            </AlertDialog>

            <AlertConfirmationDialog
                trigger={
                    <Button variant="secondary" size="md" type="button">
                        Open confirm dialog
                    </Button>
                }
                title="Confirm action?"
                description="Confirm dialog description"
                onConfirm={() => {
                    setConfirmOutcome("confirmed")
                }}
            />
            <p>Confirm outcome: {confirmOutcome}</p>

            <AlertConfirmationDialog
                trigger={
                    <Button variant="primary" size="md" type="button" destructive={true}>
                        Open delete dialog
                    </Button>
                }
                title="Delete item?"
                description="Delete dialog description"
                enterToConfirm="DELETE"
                onConfirm={() => {
                    setDeleteOutcome("deleted")
                }}
            />
            <p>Delete outcome: {deleteOutcome}</p>
        </div>
    )
}
