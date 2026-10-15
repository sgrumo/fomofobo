"use client"

import { useMutation } from "@tanstack/react-query"
import type { Todo } from "models"
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
    todoFormStateFromTodo,
    todoFormStateToUpdate,
} from "@/components/client/todo-form/todo-form.state"
import { api } from "@/lib/api/client-api"

interface UpdateTodoDialogProps {
    trigger: ReactElement
    todo: Todo
}

export const UpdateTodoDialog = (props: UpdateTodoDialogProps) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const [open, setOpen] = useState(false)
    const [pending, setPending] = useState(false)

    const onOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && pending) {
            toast.addPlain("warning", t("Todos.Toast.CloseWhileUpdating"))
            return
        }
        setOpen(nextOpen)
    }

    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            <DialogTrigger render={props.trigger} />
            <DialogContent className="max-h-[calc(min(38rem,90dvh))] w-[calc(min(30rem,90dvw))]">
                <UpdateTodoDialogContent
                    todo={props.todo}
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

interface UpdateTodoDialogContentProps {
    todo: Todo
    onMutate: () => void
    onSettled: () => void
    onSuccess: () => void
}

const UpdateTodoDialogContent = (props: UpdateTodoDialogContentProps) => {
    const { t, i18n } = useTranslation("shared")
    const toast = useToast()
    const { formId, form, setForm, errors, convert } = useForm(
        () => todoFormStateFromTodo(props.todo),
        todoFormStateToUpdate,
        i18n,
    )

    const { mutate: updateTodo, isPending } = useMutation(api.updateTodoMutation)

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        props.onMutate()
        updateTodo(
            { id: props.todo.id, body: result.value },
            {
                onSettled: props.onSettled,
                onSuccess: () => {
                    toast.addPlain("success", t("Todos.Toast.Updated"))
                    props.onSuccess()
                },
            },
        )
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>{t("Todos.Update.Title")}</DialogTitle>
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
                        intent="update"
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
                    {t("Todos.Update.Submit")}
                </Button>
            </DialogFooter>
        </>
    )
}
