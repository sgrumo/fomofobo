"use client"

import { useQuery } from "@tanstack/react-query"
import { identity } from "es-toolkit"
import { useTranslation } from "react-i18next"
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
import { CreateVenueDialog } from "@/components/client/create-venue-dialog/create-venue-dialog"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { BACKOFFICE_PAGE_SIZE } from "@/lib/backoffice/lists"

const STATE_FILTERS = ["blocked", "active"] as const

export const BackofficeVenuesView = (
    props: RouteClientComponentProps<"backofficeVenues">,
) => {
    const { t } = useTranslation("shared")
    const account = useBackofficeAccount()
    const { query, setQuery } = useDynamicRoute(routes[props.route])
    const page = query.page ?? 1
    const venues = useQuery(
        api.listVenuesQuery({
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
            title={t("Backoffice.Venues.Title")}
            search={{
                label: t("Backoffice.Venues.Search"),
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
                <CreateVenueDialog
                    trigger={
                        <Button variant="primary" size="md">
                            {t("Backoffice.Venues.New")}
                        </Button>
                    }
                />
            }
            status={venues.status}
            page={page}
            totalPages={venues.data?.totalPages ?? 0}
            onPageChange={nextPage => {
                setQuery({ page: nextPage })
            }}
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("Backoffice.Venues.Columns.Name")}</TableHead>
                        <TableHead>{t("Backoffice.Venues.Columns.Address")}</TableHead>
                        <TableHead>{t("Backoffice.Venues.Columns.Owner")}</TableHead>
                        <TableHead>{t("Backoffice.Filters.State")}</TableHead>
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
                    {venues.data?.items.map(venue => (
                        <TableRow key={venue.id}>
                            <TableCell>
                                {account.role === "admin" ||
                                venue.owner?.id === account.id ? (
                                    <RouteLink
                                        route={routes.backofficeVenue}
                                        parameters={{ id: venue.id }}
                                        query={{}}
                                        className="underline"
                                    >
                                        {venue.name}
                                    </RouteLink>
                                ) : (
                                    venue.name
                                )}
                            </TableCell>
                            <TableCell>{venue.address}</TableCell>
                            <TableCell>
                                {venue.owner?.name ?? t("Backoffice.Venue.NoOwner")}
                            </TableCell>
                            <TableCell ellipsis={false}>
                                <Badge tone={venue.isBlocked ? "ended" : "neutral"}>
                                    {venue.isBlocked
                                        ? t("Backoffice.Filters.blocked")
                                        : t("Backoffice.Filters.active")}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </BackofficeList>
    )
}
