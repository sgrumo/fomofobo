"use client"

import { useQuery } from "@tanstack/react-query"
import { identity } from "es-toolkit"
import type { Account } from "models"
import { useTranslation } from "react-i18next"
import { AlertConfirmationDialog } from "ui-components/alert-dialog"
import { Badge } from "ui-components/badge"
import { Button } from "ui-components/button"
import { Field } from "ui-components/field"
import { Select } from "ui-components/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "ui-components/table"

import { BackofficeList } from "@/components/client/backoffice-list/backoffice-list"
import { CreateOrganizerDialog } from "@/components/client/create-organizer-dialog/create-organizer-dialog"
import { SetOrganizerPasswordDialog } from "@/components/client/set-organizer-password-dialog/set-organizer-password-dialog"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { BACKOFFICE_PAGE_SIZE } from "@/lib/backoffice/lists"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"

const STATE_FILTERS = ["blocked", "active"] as const

export const BackofficeOrganizersView = (
    props: RouteClientComponentProps<"backofficeOrganizers">,
) => {
    const { t } = useTranslation("shared")
    const { query, setQuery } = useDynamicRoute(routes[props.route])
    const page = query.page ?? 1
    const organizers = useQuery(
        api.listOrganizersQuery({
            params: {},
            query: {
                page,
                pageSize: BACKOFFICE_PAGE_SIZE,
                q: query.q,
                isBlocked:
                    query.state === undefined ? undefined : query.state === "blocked",
            },
        }),
    )

    return (
        <BackofficeList
            title={t("Backoffice.Organizers.Title")}
            search={{
                label: t("Backoffice.Organizers.Search"),
                value: query.q,
                onValueChange: q => {
                    setQuery({ q, page: undefined })
                },
            }}
            filters={
                <Field
                    label={t("Backoffice.Filters.State")}
                    required={false}
                    className="w-44"
                >
                    <Select
                        multiple={false}
                        resettable={true}
                        items={[...STATE_FILTERS]}
                        getItemId={identity}
                        renderItem={({ item }) => t(`Backoffice.Filters.${item}`)}
                        placeholder={t("Backoffice.Filters.Any")}
                        value={query.state}
                        onValueChange={state => {
                            setQuery({ state, page: undefined })
                        }}
                    />
                </Field>
            }
            actions={
                <CreateOrganizerDialog
                    trigger={
                        <Button variant="primary" size="md">
                            {t("Backoffice.Organizers.New")}
                        </Button>
                    }
                />
            }
            status={organizers.status}
            page={page}
            totalPages={organizers.data?.totalPages ?? 0}
            onPageChange={nextPage => {
                setQuery({ page: nextPage })
            }}
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("Backoffice.OrganizerForm.Name")}</TableHead>
                        <TableHead>{t("Backoffice.OrganizerForm.Email")}</TableHead>
                        <TableHead>{t("Backoffice.Filters.State")}</TableHead>
                        <TableHead>{t("Backoffice.Events.Columns.Actions")}</TableHead>
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
                    {organizers.data?.items.map(organizer => (
                        <OrganizerRow key={organizer.id} organizer={organizer} />
                    ))}
                </TableBody>
            </Table>
        </BackofficeList>
    )
}

interface OrganizerRowProps {
    organizer: Account
}

const OrganizerRow = (props: OrganizerRowProps) => {
    const { t } = useTranslation("shared")
    const feedback = useMutationFeedback()
    const { organizer } = props
    const action = organizer.isBlocked ? "Unblock" : "Block"

    return (
        <TableRow>
            <TableCell>{organizer.name}</TableCell>
            <TableCell>{organizer.email}</TableCell>
            <TableCell ellipsis={false}>
                <Badge tone={organizer.isBlocked ? "ended" : "neutral"}>
                    {organizer.isBlocked
                        ? t("Backoffice.Filters.blocked")
                        : t("Backoffice.Filters.active")}
                </Badge>
            </TableCell>
            <TableCell ellipsis={false}>
                <span className="flex flex-wrap gap-1">
                    <SetOrganizerPasswordDialog
                        organizer={organizer}
                        trigger={
                            <Button variant="secondary" size="sm">
                                {t("Backoffice.Organizers.Password.Open")}
                            </Button>
                        }
                    />
                    <AlertConfirmationDialog
                        type="mutation"
                        trigger={
                            <Button variant="secondary" size="sm">
                                {t(`Backoffice.Actions.${action}`)}
                            </Button>
                        }
                        title={t(`Backoffice.Organizers.${action}.Title`)}
                        description={t(`Backoffice.Organizers.${action}.Description`, {
                            name: organizer.name,
                        })}
                        confirmLabel={t(`Backoffice.Actions.${action}`)}
                        pendingWarning={t("Backoffice.Organizers.Toast.CloseWhileSaving")}
                        mutationOptions={
                            organizer.isBlocked
                                ? api.unblockOrganizerMutation
                                : api.blockOrganizerMutation
                        }
                        variables={{ id: organizer.id }}
                        mutateOptions={{
                            onSuccess: () => {
                                feedback.succeeded(
                                    t(`Backoffice.Organizers.Toast.${action}ed`, {
                                        name: organizer.name,
                                    }),
                                )
                            },
                            onError: feedback.failed,
                        }}
                    />
                </span>
            </TableCell>
        </TableRow>
    )
}
