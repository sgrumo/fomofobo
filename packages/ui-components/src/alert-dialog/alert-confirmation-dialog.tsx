import type { MutateOptions, MutationOptions } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { cn } from "frontend-shared/styles"
import type { ReactElement } from "react"
import { useRef, useState } from "react"
import { match, P } from "ts-pattern"

import { Button } from "../button/button"
import { useUiContext } from "../i18n/ui-context"
import { IconWarningCircle } from "../icons/icons"
import { StringInput } from "../string-input/string-input"
import { useToast } from "../toast/toast.hooks"
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogClose,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./alert-dialog"

interface BaseAlertConfirmationDialogProps {
    trigger: ReactElement
    title: string
    description: string
    enterToConfirm?: string
    confirmLabel?: string
    cancelLabel?: string
    className?: string
}

interface UncontrolledAlertConfirmationDialogProps extends BaseAlertConfirmationDialogProps {
    type?: "uncontrolled"
    onConfirm: () => void
}

interface ControlledAlertConfirmationDialogProps extends BaseAlertConfirmationDialogProps {
    type: "controlled"
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

interface MutationAlertConfirmationDialogProps<
    D,
    E,
    V,
    R,
> extends BaseAlertConfirmationDialogProps {
    type: "mutation"
    pendingWarning: string
    mutationOptions: MutationOptions<D, E, V, R>
    mutateOptions: MutateOptions<D, E, V, R>
    variables: V
}

type StandardAlertConfirmationDialogProps =
    | UncontrolledAlertConfirmationDialogProps
    | ControlledAlertConfirmationDialogProps

export type AlertConfirmationDialogProps<D, E, V, R> =
    | StandardAlertConfirmationDialogProps
    | MutationAlertConfirmationDialogProps<D, E, V, R>

export const AlertConfirmationDialog = <D, E, V, R>(
    props: AlertConfirmationDialogProps<D, E, V, R>,
) =>
    props.type === "mutation" ? (
        <MutationAlertConfirmationDialog {...props} />
    ) : (
        <StandardAlertConfirmationDialog {...props} />
    )

const StandardAlertConfirmationDialog = (props: StandardAlertConfirmationDialogProps) => {
    const [ownOpen, setOwnOpen] = useState(false)

    const open = match(props)
        .with({ type: P.optional("uncontrolled") }, () => ownOpen)
        .with({ type: "controlled" }, matchedProps => matchedProps.open)
        .exhaustive()
    const setOpen = match(props)
        .returnType<(open: boolean) => void>()
        .with({ type: P.optional("uncontrolled") }, () => setOwnOpen)
        .with({ type: "controlled" }, matchedProps => matchedProps.onOpenChange)
        .exhaustive()

    const onConfirm = () => {
        props.onConfirm()
        setOpen(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger render={props.trigger} />
            <AlertDialogContent
                className={cn("w-[calc(min(30rem,90dvw))]", props.className)}
            >
                <AlertConfirmationDialogInnerContent
                    title={props.title}
                    description={props.description}
                    enterToConfirm={props.enterToConfirm}
                    confirmLabel={props.confirmLabel}
                    cancelLabel={props.cancelLabel}
                    confirmPending={false}
                    onConfirm={onConfirm}
                />
            </AlertDialogContent>
        </AlertDialog>
    )
}

const MutationAlertConfirmationDialog = <D, E, V, R>(
    props: MutationAlertConfirmationDialogProps<D, E, V, R>,
) => {
    const [open, setOpen] = useState(false)
    const toast = useToast()
    // The options of the confirmed write: a refetch can re-render the dialog with the options of
    // another write, as an Unblock in place of a Block, before the confirmed one settles
    const confirmedRef = useRef(props)
    // Callbacks of `useMutation` still run once the dialog unmounts, as when the write moves its
    // row out of the list. Callbacks of `mutate` would not.
    const { mutate, isPending } = useMutation({
        ...props.mutationOptions,
        onSuccess: async (data, variables, result, context) => {
            const confirmed = confirmedRef.current
            await confirmed.mutationOptions.onSuccess?.(data, variables, result, context)
            confirmed.mutateOptions.onSuccess?.(data, variables, result, context)
            setOpen(false)
        },
        onError: async (error, variables, result, context) => {
            const confirmed = confirmedRef.current
            await confirmed.mutationOptions.onError?.(error, variables, result, context)
            confirmed.mutateOptions.onError?.(error, variables, result, context)
        },
        onSettled: async (data, error, variables, result, context) => {
            const confirmed = confirmedRef.current
            await confirmed.mutationOptions.onSettled?.(
                data,
                error,
                variables,
                result,
                context,
            )
            confirmed.mutateOptions.onSettled?.(data, error, variables, result, context)
        },
    })

    const onConfirm = () => {
        confirmedRef.current = props
        mutate(props.variables)
    }

    const onOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isPending) {
            toast.addPlain("warning", props.pendingWarning)
            return
        }
        setOpen(nextOpen)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogTrigger render={props.trigger} />
            <AlertDialogContent
                className={cn("w-[calc(min(30rem,90dvw))]", props.className)}
            >
                <AlertConfirmationDialogInnerContent
                    title={props.title}
                    description={props.description}
                    enterToConfirm={props.enterToConfirm}
                    confirmLabel={props.confirmLabel}
                    cancelLabel={props.cancelLabel}
                    confirmPending={isPending}
                    onConfirm={onConfirm}
                />
            </AlertDialogContent>
        </AlertDialog>
    )
}

interface AlertConfirmationDialogInnerContentProps {
    title: string
    description: string
    enterToConfirm: string | undefined
    confirmLabel: string | undefined
    cancelLabel: string | undefined
    confirmPending: boolean | undefined
    onConfirm: () => void
}
const AlertConfirmationDialogInnerContent = (
    props: AlertConfirmationDialogInnerContentProps,
) => {
    const { i18n } = useUiContext()

    const [confirmationInput, setConfirmationInput] = useState<string | undefined>(
        undefined,
    )

    const enterToConfirmSatisfied =
        !props.enterToConfirm || confirmationInput === props.enterToConfirm

    const confirmDisabled = !enterToConfirmSatisfied || !!props.confirmPending

    const onConfirm = () => {
        if (confirmDisabled) {
            return
        }
        props.onConfirm()
    }

    return (
        <>
            <AlertDialogHeader>
                <div className="flex items-center gap-2">
                    <IconWarningCircle className="text-danger size-6 shrink-0" />
                    <AlertDialogTitle>{props.title}</AlertDialogTitle>
                </div>
            </AlertDialogHeader>
            <AlertDialogBody className="flex flex-col gap-3">
                <AlertDialogDescription>{props.description}</AlertDialogDescription>
                {props.enterToConfirm && (
                    <div className="flex flex-col gap-1">
                        <div className="tp-body-md text-fg">
                            <span>{`${i18n.t("AlertConfirmationDialog.EnterText", undefined)} `}</span>
                            <span className="tp-pixel-md">{`"${props.enterToConfirm}"`}</span>
                            <span>{` ${i18n.t("AlertConfirmationDialog.ToConfirm", undefined)}`}</span>
                        </div>
                        <StringInput
                            value={confirmationInput}
                            onValueChange={setConfirmationInput}
                            placeholder={props.enterToConfirm}
                        />
                    </div>
                )}
            </AlertDialogBody>
            <AlertDialogFooter className="grid grid-cols-2 gap-2">
                <AlertDialogClose
                    render={
                        <Button variant="secondary" size="md" type="button">
                            {props.cancelLabel ?? i18n.t("Shared.Cancel", undefined)}
                        </Button>
                    }
                />
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    destructive={true}
                    onClick={onConfirm}
                    disabled={confirmDisabled}
                    loading={!!props.confirmPending}
                >
                    {props.confirmLabel ?? i18n.t("Shared.Confirm", undefined)}
                </Button>
            </AlertDialogFooter>
        </>
    )
}
