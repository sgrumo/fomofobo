import { noop } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import type { ReactNode } from "react"
import {
    AlertConfirmationDialog,
    AlertDialog,
    AlertDialogBody,
    AlertDialogClose,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "ui-components/alert-dialog"
import { Button } from "ui-components/button"
import { useToast } from "ui-components/toast"

interface AlertDialogSectionShowcaseProps {
    heading: string
    children: ReactNode
}
const AlertDialogSectionShowcase = (props: AlertDialogSectionShowcaseProps) => (
    <div className="flex flex-col gap-4">
        <p className="tp-h4-semibold">{props.heading}</p>
        <div className="flex flex-wrap gap-4">{props.children}</div>
    </div>
)

interface AlertDialogShowcaseProps {
    className?: string
}
export const AlertDialogShowcase = (props: AlertDialogShowcaseProps) => {
    const toast = useToast()

    return (
        <div className={cn("flex flex-col gap-6", props.className)}>
            <AlertDialogSectionShowcase heading="Base">
                <AlertDialog>
                    <AlertDialogTrigger
                        render={
                            <Button
                                variant="primary"
                                size="md"
                                type="button"
                                destructive={true}
                            >
                                Delete Item (base)
                            </Button>
                        }
                    />
                    <AlertDialogContent className="max-w-[calc(min(40rem_,90dvw))]">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <AlertDialogDescription>
                                Confirm that you want to delete this item.
                            </AlertDialogDescription>
                            <p className="tp-b2-regular text-neutral-800 dark:text-neutral-100">
                                This action cannot be undone. This will permanently delete
                                the item and all associated data.
                            </p>
                        </AlertDialogBody>
                        <AlertDialogFooter className="grid grid-cols-2 gap-2">
                            <AlertDialogClose
                                render={
                                    <Button variant="secondary" size="md" type="button">
                                        Cancel
                                    </Button>
                                }
                            />
                            <Button
                                variant="primary"
                                size="md"
                                type="button"
                                destructive={true}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AlertDialogSectionShowcase>

            <AlertDialogSectionShowcase heading="Confirmation">
                <AlertConfirmationDialog
                    trigger={
                        <Button
                            variant="primary"
                            size="md"
                            type="button"
                            destructive={true}
                        >
                            Delete user (confirmation)
                        </Button>
                    }
                    title="Delete user?"
                    description="Are you sure you want to delete this user? This action cannot be undone."
                    onConfirm={noop}
                />

                <AlertConfirmationDialog
                    trigger={
                        <Button
                            variant="primary"
                            size="md"
                            type="button"
                            destructive={true}
                        >
                            Delete user (text confirmation)
                        </Button>
                    }
                    title="Delete user?"
                    description="Are you sure you want to delete this user? This action cannot be undone."
                    enterToConfirm="Alice Johnson"
                    onConfirm={noop}
                />
            </AlertDialogSectionShowcase>

            <AlertDialogSectionShowcase heading="Mutation">
                <AlertConfirmationDialog
                    type="mutation"
                    pendingWarning="The user is still being created."
                    trigger={
                        <Button variant="primary" size="md" type="button">
                            Create user (mutation)
                        </Button>
                    }
                    title="Create user?"
                    description="Confirm to create this user. The dialog stays open until the request completes."
                    mutationOptions={{ mutationFn: resolveAfter({ ms: 1500 }) }}
                    mutateOptions={{
                        onSuccess: name => {
                            toast.add({ type: "success", messages: [`Created ${name}`] })
                        },
                    }}
                    variables="Alice Johnson"
                />

                <AlertConfirmationDialog
                    type="mutation"
                    pendingWarning="The user is still being updated."
                    trigger={
                        <Button variant="primary" size="md" type="button">
                            Update user (mutation)
                        </Button>
                    }
                    title="Update user?"
                    description="Confirm to update this user. The dialog stays open until the request completes."
                    mutationOptions={{ mutationFn: resolveAfter({ ms: 1500 }) }}
                    mutateOptions={{
                        onSuccess: name => {
                            toast.add({ type: "success", messages: [`Updated ${name}`] })
                        },
                    }}
                    variables="Alice Johnson"
                />

                <AlertConfirmationDialog
                    type="mutation"
                    pendingWarning="The user is still being deleted."
                    trigger={
                        <Button
                            variant="primary"
                            size="md"
                            type="button"
                            destructive={true}
                        >
                            Delete user (mutation)
                        </Button>
                    }
                    title="Delete user?"
                    description="Confirm to delete this user. The dialog stays open until the request completes."
                    mutationOptions={{ mutationFn: resolveAfter({ ms: 1500 }) }}
                    mutateOptions={{
                        onSuccess: name => {
                            toast.add({ type: "success", messages: [`Deleted ${name}`] })
                        },
                    }}
                    variables="Alice Johnson"
                />

                <AlertConfirmationDialog
                    type="mutation"
                    pendingWarning="The user is still being deleted."
                    trigger={
                        <Button
                            variant="primary"
                            size="md"
                            type="button"
                            destructive={true}
                        >
                            Delete user (mutation + text)
                        </Button>
                    }
                    title="Delete user?"
                    description="Confirm to delete this user. The dialog stays open until the request completes."
                    enterToConfirm="Alice Johnson"
                    mutationOptions={{ mutationFn: resolveAfter({ ms: 1500 }) }}
                    mutateOptions={{
                        onSuccess: name => {
                            toast.add({ type: "success", messages: [`Deleted ${name}`] })
                        },
                    }}
                    variables="Alice Johnson"
                />
            </AlertDialogSectionShowcase>
        </div>
    )
}

/**
 * @description Returns a resolver yielding its argument after the delay
 * @param args Delay, in milliseconds
 */
const resolveAfter =
    (args: { ms: number }) =>
    (name: string): Promise<string> =>
        new Promise(resolve => {
            setTimeout(() => {
                resolve(name)
            }, args.ms)
        })
