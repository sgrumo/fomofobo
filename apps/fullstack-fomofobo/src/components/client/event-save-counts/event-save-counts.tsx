"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { Spinner } from "ui-components/spinner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "ui-components/table"

import { api } from "@/lib/api/client-api"
import { formatLocalDate, localTimeOf } from "@/lib/events/local-format"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

interface EventSaveCountsProps {
    eventId: string
}

export const EventSaveCounts = (props: EventSaveCountsProps) => {
    const { t } = useTranslation("shared")
    const counts = useQuery(
        api.listEventSaveCountsQuery({ params: { id: props.eventId }, query: {} }),
    )

    return (
        <section
            aria-label={t("Backoffice.EventSaves.Title")}
            className="flex max-w-3xl flex-col gap-3"
        >
            <h2 className="tp-pixel-md">{t("Backoffice.EventSaves.Title")}</h2>
            {counts.isPending ? (
                <Spinner title={t("Backoffice.EventSaves.Loading")} />
            ) : counts.isError ? (
                <Alert type="error" text={t("Backoffice.EventSaves.Error")} />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                {t("Backoffice.EventSaves.Columns.Date")}
                            </TableHead>
                            <TableHead>
                                {t("Backoffice.EventSaves.Columns.Saves")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        showEmptyFallback={true}
                        emptyFallback={
                            <p className="tp-body-md py-8 text-center">
                                {t("Backoffice.EventSaves.Empty")}
                            </p>
                        }
                    >
                        {counts.data.map(entry => (
                            <TableRow key={entry.date}>
                                <TableCell>
                                    {formatLocalDate(entry.date)}{" "}
                                    {localTimeOf(
                                        new Date(entry.startsAt),
                                        PLATFORM_TIME_ZONE,
                                    )}
                                </TableCell>
                                <TableCell>
                                    {t("Detail.Interested", { count: entry.count })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </section>
    )
}
