"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { AlertConfirmationDialog } from "ui-components/alert-dialog"
import { Button } from "ui-components/button"
import { PixelIcon } from "ui-components/pixel-icons"
import { Spinner } from "ui-components/spinner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "ui-components/table"

import { CreateCategoryDialog } from "@/components/client/create-category-dialog/create-category-dialog"
import { UpdateCategoryDialog } from "@/components/client/update-category-dialog/update-category-dialog"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"

export const BackofficeCategoriesView = (
    _props: RouteClientComponentProps<"backofficeCategories">,
) => {
    const { t } = useTranslation("shared")
    const feedback = useMutationFeedback()
    const categories = useQuery(api.listCategoriesQuery({ params: {}, query: {} }))

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="tp-pixel-xl">{t("Backoffice.Categories.Title")}</h1>
                <CreateCategoryDialog
                    trigger={
                        <Button variant="primary" size="md">
                            {t("Backoffice.Categories.New")}
                        </Button>
                    }
                />
            </div>
            {categories.isPending && <Spinner title={t("Backoffice.List.Loading")} />}
            {categories.isError && (
                <Alert type="error" text={t("Backoffice.List.Error")} />
            )}
            {categories.isSuccess && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("Backoffice.CategoryForm.Icon")}</TableHead>
                            <TableHead>{t("Backoffice.CategoryForm.Name")}</TableHead>
                            <TableHead>
                                {t("Backoffice.Events.Columns.Actions")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        showEmptyFallback={true}
                        emptyFallback={
                            <p className="tp-body-md py-8 text-center">
                                {t("Backoffice.List.Empty")}
                            </p>
                        }
                    >
                        {categories.data.map(category => (
                            <TableRow key={category.id}>
                                <TableCell>
                                    <PixelIcon name={category.icon} className="size-5" />
                                </TableCell>
                                <TableCell>{category.name}</TableCell>
                                <TableCell ellipsis={false}>
                                    <span className="flex flex-wrap gap-1">
                                        <UpdateCategoryDialog
                                            category={category}
                                            trigger={
                                                <Button variant="secondary" size="sm">
                                                    {t("Backoffice.Actions.Edit")}
                                                </Button>
                                            }
                                        />
                                        {/* PLACEHOLDER(OP-24): refused while an event uses it */}
                                        <AlertConfirmationDialog
                                            type="mutation"
                                            trigger={
                                                <Button variant="secondary" size="sm">
                                                    {t("Backoffice.Actions.Delete")}
                                                </Button>
                                            }
                                            title={t(
                                                "Backoffice.Categories.Delete.Title",
                                            )}
                                            description={t(
                                                "Backoffice.Categories.Delete.Description",
                                                { name: category.name },
                                            )}
                                            confirmLabel={t("Backoffice.Actions.Delete")}
                                            pendingWarning={t(
                                                "Backoffice.Categories.Toast.CloseWhileDeleting",
                                            )}
                                            mutationOptions={api.deleteCategoryMutation}
                                            variables={{ id: category.id }}
                                            mutateOptions={{
                                                onSuccess: () => {
                                                    feedback.succeeded(
                                                        t(
                                                            "Backoffice.Categories.Toast.Deleted",
                                                            {
                                                                name: category.name,
                                                            },
                                                        ),
                                                    )
                                                },
                                                onError: feedback.failed,
                                            }}
                                        />
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </section>
    )
}
