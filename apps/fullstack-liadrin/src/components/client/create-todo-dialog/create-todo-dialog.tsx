"use client"

import { useMutation } from "@tanstack/react-query"
import type { ReactElement } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-shared"
import { Button } from "ui-components/button"
import {
    DialogBody,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "ui-components/dialog"
import { Form } from "ui-components/form"
import { useToast } from "ui-components/toast"

import { TodoForm } from "@/components/client/todo-form/todo-form"
import {
    initialTodoFormState,
    todoFormStateToCreation,
} from "@/components/client/todo-form/todo-form.state"
import { api } from "@/lib/api/client-api"

interface CreateTodoDialogProps {
    trigger: ReactElement
}

export const CreateTodoDialog = (props: CreateTodoDialogProps) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const [open, setOpen] = useState(false)
    const [pending, setPending] = useState(false)

    const onOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && pending) {
            toast.addPlain("warning", t("Todos.Toast.CloseWhileCreating"))
            return
        }
        setOpen(nextOpen)
    }

    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            <DialogTrigger render={props.trigger} />
            <DialogContent className="max-h-[calc(min(34rem,90dvh))] w-[calc(min(30rem,90dvw))]">
                <CreateTodoDialogContent
                    onMutate={() => {
                        setPending(true)
                    }}
                    onSettled={() => {
                        setPending(false)
                    }}
                    onSuccess={() => {
                        setOpen(false)
                    }}
                />
            </DialogContent>
        </DialogRoot>
    )
}

interface CreateTodoDialogContentProps {
    onMutate: () => void
    onSettled: () => void
    onSuccess: () => void
}

const CreateTodoDialogContent = (props: CreateTodoDialogContentProps) => {
    const { t, i18n } = useTranslation("shared")
    const toast = useToast()
    const { formId, form, setForm, errors, convert } = useForm(
        initialTodoFormState,
        todoFormStateToCreation,
        i18n,
    )

    const { mutate: createTodo, isPending } = useMutation(api.createTodoMutation)

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        props.onMutate()
        createTodo(result.value, {
            onSettled: props.onSettled,
            onSuccess: () => {
                toast.addPlain("success", t("Todos.Toast.Created"))
                props.onSuccess()
            },
        })
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>{t("Todos.Create.Title")}</DialogTitle>
            </DialogHeader>
            <DialogBody>
                <Form
                    mode="edit"
                    id={formId}
                    className="flex flex-col gap-4"
                    onSubmit={handleSubmit}
                    noValidate={true}
                >
                    <TodoForm
                        value={form}
                        onValueChange={setForm}
                        errors={errors}
                        intent="create"
                    />
                </Form>
            </DialogBody>
            <DialogFooter className="grid grid-cols-2 gap-2">
                <DialogClose
                    render={
                        <Button
                            variant="secondary"
                            size="md"
                            type="button"
                            disabled={isPending}
                        >
                            {t("Todos.Cancel")}
                        </Button>
                    }
                />
                <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    form={formId}
                    loading={isPending}
                >
                    {t("Todos.Create.Submit")}
                </Button>
            </DialogFooter>
        </>
    )
}
