"use client"

import { ComponentsShowcase } from "components-showcase"
import { useTranslation } from "react-i18next"

import { ComponentErrorBoundary } from "@/components/client/component-error-boundary/component-error-boundary"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { parseFormState } from "@/lib/forms/forms"

type DevShowcaseViewProps = RouteClientComponentProps<"devShowcase">

export const DevShowcaseView = (_props: DevShowcaseViewProps) => {
    const { i18n } = useTranslation("shared")

    return (
        <ComponentsShowcase
            errorBoundary={ComponentErrorBoundary}
            parseFormState={(schema, data) => parseFormState(schema, data, i18n)}
        />
    )
}
