"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { Spinner } from "ui-components/spinner"

import { EventEditor } from "@/components/client/event-editor/event-editor"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"

export const BackofficeEventView = (
    props: RouteClientComponentProps<"backofficeEvent">,
) => {
    const { t } = useTranslation("shared")
    const { parameters } = useDynamicRoute(routes[props.route])
    const event = useQuery(
        api.getBackofficeEventQuery({ params: { id: parameters.id }, query: {} }),
    )

    if (event.isPending) {
        return <Spinner title={t("Backoffice.List.Loading")} />
    }
    if (event.isError) {
        return <Alert type="error" text={t("Backoffice.Errors.EventNotFound")} />
    }
    return <EventEditor event={event.data} />
}
