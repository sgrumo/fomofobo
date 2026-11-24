"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { Button } from "ui-components/button"

import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { answerOauthConsent, fetchOauthPublicClient } from "@/lib/auth/oauth"

/**
 * @description Fetches the client that the signed authorization query of the page URL names, with its id
 */
const fetchClientOfPage = async () => {
    const clientId =
        new URLSearchParams(globalThis.location.search).get("client_id") ?? ""
    return { clientId, details: await fetchOauthPublicClient(clientId) }
}

/**
 * @description Sends the answer with the signed authorization query of the page URL
 * @param accept True to grant the access
 */
const answerFromPage = async (accept: boolean) =>
    await answerOauthConsent(accept, globalThis.location.search.slice(1))

/**
 * @description Returns the host of a client id, or `undefined` when the id is no URL
 * @param clientId Client id of the authorization query
 */
const hostOf = (clientId: string | undefined): string | undefined =>
    clientId === undefined ? undefined : URL.parse(clientId)?.host

export const OauthConsentView = (
    _props: RouteClientComponentProps<"backofficeOauthConsent">,
) => {
    const { t } = useTranslation("shared")
    const client = useQuery({
        queryKey: ["oauth-public-client"],
        queryFn: fetchClientOfPage,
        retry: false,
    })
    const answer = useMutation({
        mutationFn: answerFromPage,
        onSuccess: outcome => {
            if (outcome.kind === "redirect") {
                globalThis.location.assign(outcome.url)
            }
        },
    })
    const busy = answer.isPending || answer.data?.kind === "redirect"
    const failed =
        client.isError || (answer.data !== undefined && answer.data.kind !== "redirect")
    const site = hostOf(client.data?.clientId)

    return (
        <main className="bg-surface text-fg flex min-h-dvh items-center justify-center p-4">
            <div className="border-line shadow-hard-md flex w-full max-w-sm flex-col gap-4 border-2 p-6">
                <h1 className="tp-pixel-xl">{t("Backoffice.OauthConsent.Title")}</h1>
                {client.data !== undefined && (
                    <p>
                        {t("Backoffice.OauthConsent.Request", {
                            client:
                                client.data.details.client_name ??
                                t("Backoffice.OauthConsent.UnknownClient"),
                        })}
                    </p>
                )}
                {site !== undefined && (
                    <p>{t("Backoffice.OauthConsent.Site", { site })}</p>
                )}
                {failed && (
                    <Alert type="error" text={t("Backoffice.OauthConsent.Failed")} />
                )}
                <div className="flex gap-2">
                    <Button
                        variant="primary"
                        size="md"
                        disabled={client.data === undefined || busy}
                        loading={busy && answer.variables === true}
                        onClick={() => {
                            answer.mutate(true)
                        }}
                    >
                        {t("Backoffice.OauthConsent.Approve")}
                    </Button>
                    <Button
                        variant="secondary"
                        size="md"
                        disabled={client.data === undefined || busy}
                        loading={busy && answer.variables === false}
                        onClick={() => {
                            answer.mutate(false)
                        }}
                    >
                        {t("Backoffice.OauthConsent.Deny")}
                    </Button>
                </div>
            </div>
        </main>
    )
}
