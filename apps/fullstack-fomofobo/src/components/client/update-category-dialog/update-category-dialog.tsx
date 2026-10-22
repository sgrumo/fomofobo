"use client"

import { useMutation } from "@tanstack/react-query"
import type { Category } from "models"
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

import { CategoryForm } from "@/components/client/category-form/category-form"
import {
    categoryFormStateFromCategory,
    categoryFormStateToCreation,
} from "@/components/client/category-form/category-form.state"
import { CategoryImageEditor } from "@/components/client/category-image-editor/category-image-editor"
import { api } from "@/lib/api/client-api"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"

interface UpdateCategoryDialogProps {
    trigger: ReactElement
    category: Category
}

export const UpdateCategoryDialog = (props: UpdateCategoryDialogProps) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const [open, setOpen] = useState(false)
    const [pending, setPending] = useState(false)

    const onOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && pending) {
            toast.addPlain("warning", t("Backoffice.Categories.Toast.CloseWhileUpdating"))
            return
        }
        setOpen(nextOpen)
    }

    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            <DialogTrigger render={props.trigger} />
            <DialogContent className="max-h-[calc(min(44rem,90dvh))] w-[calc(min(30rem,90dvw))]">
                <UpdateCategoryDialogContent
                    category={props.category}
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

interface UpdateCategoryDialogContentProps {
    category: Category
    onMutate: () => void
    onSettled: () => void
    onSuccess: () => void
}

const UpdateCategoryDialogContent = (props: UpdateCategoryDialogContentProps) => {
    const { t, i18n } = useTranslation("shared")
    const toast = useToast()
    const feedback = useMutationFeedback()
    const { formId, form, setForm, errors, convert } = useForm(
        () => categoryFormStateFromCategory(props.category),
        categoryFormStateToCreation,
        i18n,
    )
    const { mutate, isPending } = useMutation(api.updateCategoryMutation)

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        props.onMutate()
        mutate(
            { id: props.category.id, body: result.value },
            {
                onSettled: props.onSettled,
                onSuccess: category => {
                    feedback.succeeded(
                        t("Backoffice.Categories.Toast.Updated", { name: category.name }),
                    )
                    props.onSuccess()
                },
                onError: feedback.failed,
            },
        )
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>{t("Backoffice.Categories.Update.Title")}</DialogTitle>
            </DialogHeader>
            <DialogBody>
                <Form
                    id={formId}
                    mode="edit"
                    noValidate={true}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <CategoryForm
                        value={form}
                        onValueChange={setForm}
                        errors={errors}
                        disabled={isPending}
                    />
                </Form>
                <CategoryImageEditor
                    category={props.category}
                    disabled={isPending}
                    onMutate={props.onMutate}
                    onSettled={props.onSettled}
                />
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
                            {t("Backoffice.Actions.Cancel")}
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
                    {t("Backoffice.Actions.Save")}
                </Button>
            </DialogFooter>
        </>
    )
}
