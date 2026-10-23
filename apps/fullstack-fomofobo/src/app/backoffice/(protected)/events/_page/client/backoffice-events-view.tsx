"use client"

import { useQuery } from "@tanstack/react-query"
import { formatLocalDateTime } from "domain/local-format"
import { identity } from "es-toolkit"
import type { EventListItem } from "models"
import { useRouter } from "next/navigation"
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
import { useBackofficeAccount } from "@/components/client/backoffice-shell/backoffice-shell.context"
import { BlockEventDialog } from "@/components/client/block-event-dialog/block-event-dialog"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { BACKOFFICE_PAGE_SIZE, ORGANIZER_PICKER_SIZE } from "@/lib/backoffice/lists"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"

const STATE_FILTERS = ["blocked", "active"] as const

export const BackofficeEventsView = (
    props: RouteClientComponentProps<"backofficeEvents">,
) => {
    const { t } = useTranslation("shared")
    const account = useBackofficeAccount()
    const isAdmin = account.role === "admin"
    const router = useRouter()
    const { query, setQuery } = useDynamicRoute(routes[props.route])
    const page = query.page ?? 1

    const events = useQuery(
        api.listBackofficeEventsQuery({
            params: {},
            query: {
                page,
                pageSize: BACKOFFICE_PAGE_SIZE,
                q: query.q,
                organizerId: isAdmin ? query.organizer : undefined,
                isBlocked:
                    query.state === undefined ? undefined : query.state === "blocked",
            },
        }),
    )
    const organizers = useQuery({
        ...api.listOrganizersQuery({
            params: {},
            query: {
                page: 1,
                pageSize: ORGANIZER_PICKER_SIZE,
                q: undefined,
                isBlocked: undefined,
            },
        }),
        enabled: isAdmin,
    })
    const organizerItems = organizers.data?.items ?? []

    return (
        <BackofficeList
            title={t("Backoffice.Events.Title")}
            search={{
                label: t("Backoffice.Events.Search"),
                value: query.q,
                onValueChange: q => {
                    setQuery({ q, page: undefined })
                },
            }}
            filters={
                <>
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
                    {isAdmin && (
                        <Field
                            label={t("Backoffice.Events.Organizer")}
                            required={false}
                            className="w-60"
                        >
                            <Select
                                multiple={false}
                                resettable={true}
                                loading={organizers.isPending}
                                items={organizerItems}
                                getItemId={organizer => organizer.id}
                                renderItem={({ item }) => item.name}
                                placeholder={t("Backoffice.Filters.Any")}
                                value={organizerItems.find(
                                    organizer => organizer.id === query.organizer,
                                )}
                                onValueChange={organizer => {
                                    setQuery({
                                        organizer: organizer?.id,
                                        page: undefined,
                                    })
                                }}
                            />
                        </Field>
                    )}
                </>
            }
            actions={
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                        router.push(
                            routes.backofficeEventNew.path({ parameters: {}, query: {} }),
                        )
                    }}
                >
                    {t("Backoffice.Events.New")}
                </Button>
            }
            status={events.status}
            page={page}
            totalPages={events.data?.totalPages ?? 0}
            onPageChange={nextPage => {
                setQuery({ page: nextPage })
            }}
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("Backoffice.Events.Columns.Title")}</TableHead>
                        <TableHead>{t("Backoffice.Events.Columns.Start")}</TableHead>
                        <TableHead>{t("Backoffice.Events.Columns.Venue")}</TableHead>
                        <TableHead>{t("Backoffice.Events.Columns.Repeat")}</TableHead>
                        {isAdmin && (
                            <TableHead>
                                {t("Backoffice.Events.Columns.Organizer")}
                            </TableHead>
                        )}
                        <TableHead>{t("Backoffice.Events.Columns.State")}</TableHead>
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
                    {events.data?.items.map(event => (
                        <EventRow key={event.id} event={event} isAdmin={isAdmin} />
                    ))}
                </TableBody>
            </Table>
        </BackofficeList>
    )
}

interface EventRowProps {
    event: EventListItem
    isAdmin: boolean
}

const EventRow = (props: EventRowProps) => {
    const { t } = useTranslation("shared")
    const feedback = useMutationFeedback()

    return (
        <TableRow>
            <TableCell>
                <RouteLink
                    route={routes.backofficeEvent}
                    parameters={{ id: props.event.id }}
                    query={{}}
                    className="underline"
                >
                    {props.event.title}
                </RouteLink>
            </TableCell>
            <TableCell>{formatLocalDateTime(props.event.startsAt)}</TableCell>
            <TableCell>{props.event.venue.name}</TableCell>
            <TableCell>
                {props.event.isRecurring
                    ? t("Backoffice.Events.Repeating")
                    : t("Backoffice.Events.Single")}
            </TableCell>
            {props.isAdmin && <TableCell>{props.event.organizer.name}</TableCell>}
            <TableCell ellipsis={false}>
                {props.event.isBlocked ? (
                    <span className="flex flex-col gap-1">
                        <Badge tone="ended">{t("Backoffice.Filters.blocked")}</Badge>
                        {/* PLACEHOLDER(OP-22): the reason of the block */}
                        {props.event.blockReason !== null && (
                            <span className="tp-body-sm">{props.event.blockReason}</span>
                        )}
                    </span>
                ) : (
                    <Badge tone="neutral">{t("Backoffice.Filters.active")}</Badge>
                )}
            </TableCell>
            <TableCell ellipsis={false}>
                <span className="flex flex-wrap gap-1">
                    <AlertConfirmationDialog
                        type="mutation"
                        trigger={
                            <Button variant="secondary" size="sm">
                                {t("Backoffice.Actions.Delete")}
                            </Button>
                        }
                        title={t("Backoffice.Events.Delete.Title")}
                        description={t("Backoffice.Events.Delete.Description", {
                            title: props.event.title,
                        })}
                        confirmLabel={t("Backoffice.Actions.Delete")}
                        pendingWarning={t("Backoffice.Events.Toast.CloseWhileDeleting")}
                        mutationOptions={api.deleteEventMutation}
                        variables={{ id: props.event.id }}
                        mutateOptions={{
                            onSuccess: () => {
                                feedback.succeeded(
                                    t("Backoffice.Events.Toast.Deleted", {
                                        title: props.event.title,
                                    }),
                                )
                            },
                            onError: feedback.failed,
                        }}
                    />
                    {props.isAdmin &&
                        (props.event.isBlocked ? (
                            <AlertConfirmationDialog
                                type="mutation"
                                trigger={
                                    <Button variant="secondary" size="sm">
                                        {t("Backoffice.Actions.Unblock")}
                                    </Button>
                                }
                                title={t("Backoffice.Events.Unblock.Title")}
                                description={t("Backoffice.Events.Unblock.Description", {
                                    title: props.event.title,
                                })}
                                confirmLabel={t("Backoffice.Actions.Unblock")}
                                pendingWarning={t(
                                    "Backoffice.Events.Toast.CloseWhileUnblocking",
                                )}
                                mutationOptions={api.unblockEventMutation}
                                variables={{ id: props.event.id }}
                                mutateOptions={{
                                    onSuccess: () => {
                                        feedback.succeeded(
                                            t("Backoffice.Events.Toast.Unblocked", {
                                                title: props.event.title,
                                            }),
                                        )
                                    },
                                    onError: feedback.failed,
                                }}
                            />
                        ) : (
                            <BlockEventDialog
                                event={props.event}
                                trigger={
                                    <Button variant="secondary" size="sm">
                                        {t("Backoffice.Actions.Block")}
                                    </Button>
                                }
                            />
                        ))}
                </span>
            </TableCell>
        </TableRow>
    )
}
