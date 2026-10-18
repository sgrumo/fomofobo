"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Button } from "ui-components/button"
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
import { UpdateVenueDialog } from "@/components/client/update-venue-dialog/update-venue-dialog"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { BACKOFFICE_PAGE_SIZE } from "@/lib/backoffice/lists"

export const BackofficeVenuesView = (
    props: RouteClientComponentProps<"backofficeVenues">,
) => {
    const { t } = useTranslation("shared")
    const account = useBackofficeAccount()
    // PLACEHOLDER(OP-20): every account creates a venue, an Admin alone edits one
    const canEdit = account.role === "admin"
    const { query, setQuery } = useDynamicRoute(routes[props.route])
    const page = query.page ?? 1
    const venues = useQuery(
        api.listVenuesQuery({
            params: {},
            query: { page, pageSize: BACKOFFICE_PAGE_SIZE, q: query.q },
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
                        {canEdit && (
                            <TableHead>
                                {t("Backoffice.Events.Columns.Actions")}
                            </TableHead>
                        )}
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
                            <TableCell>{venue.name}</TableCell>
                            <TableCell>{venue.address}</TableCell>
                            {canEdit && (
                                <TableCell ellipsis={false}>
                                    <UpdateVenueDialog
                                        venue={venue}
                                        trigger={
                                            <Button variant="secondary" size="sm">
                                                {t("Backoffice.Actions.Edit")}
                                            </Button>
                                        }
                                    />
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </BackofficeList>
    )
}
