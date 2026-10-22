"use client"

import { useMutation } from "@tanstack/react-query"
import type { Category } from "models"
import { useTranslation } from "react-i18next"

import { DitheredImageField } from "@/components/client/dithered-image-field/dithered-image-field"
import { api } from "@/lib/api/client-api"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"

interface CategoryImageEditorProps {
    category: Category
    disabled: boolean
    onMutate: () => void
    onSettled: () => void
}

export const CategoryImageEditor = (props: CategoryImageEditorProps) => {
    const { t } = useTranslation("shared")
    const feedback = useMutationFeedback()
    const { mutate: updateCategory, isPending } = useMutation(api.updateCategoryMutation)

    return (
        <DitheredImageField
            copy={{
                label: t("Backoffice.CategoryImage.Label"),
                hint: t("Backoffice.CategoryImage.Hint"),
                none: t("Backoffice.CategoryImage.None"),
                upload: t("Backoffice.CategoryImage.Upload"),
                remove: t("Backoffice.CategoryImage.Remove"),
                saving: t("Backoffice.CategoryImage.Saving"),
            }}
            imageUrl={props.category.imageUrl}
            disabled={props.disabled}
            saving={isPending}
            createTicket={body =>
                api.createCategoryImageUploadTicket({
                    params: { id: props.category.id },
                    body,
                })
            }
            onSave={imageKey => {
                props.onMutate()
                updateCategory(
                    { id: props.category.id, body: { imageKey } },
                    {
                        onSettled: props.onSettled,
                        onSuccess: category => {
                            feedback.succeeded(
                                t("Backoffice.Categories.Toast.Updated", {
                                    name: category.name,
                                }),
                            )
                        },
                        onError: feedback.failed,
                    },
                )
            }}
        />
    )
}
