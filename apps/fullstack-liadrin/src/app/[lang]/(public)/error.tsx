"use client"

import { ErrorView } from "@/components/client/error-view/error-view"

interface ErrorPageProps {
    error: Error
}

// Catches a failure of one route, so the layout and its navigation stay mounted.
const ErrorPage = (props: ErrorPageProps) => (
    <ErrorView error={props.error} kind="inside-layout" className="grow" />
)

export default ErrorPage
