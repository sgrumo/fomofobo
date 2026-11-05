import "server-only"
import type { LanguageKey } from "i18n/i18n"

import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import { getTranslation } from "@/lib/i18n/server/translation"
import { CONTACT_EMAIL } from "@/lib/platform/platform"

const SECTIONS = [
    "Controller",
    "NotCollected",
    "Location",
    "PlaceSearch",
    "Saves",
    "IpAddress",
    "DeviceStorage",
    "Providers",
    "Organizers",
    "LegalBasis",
    "Rights",
    "Minors",
    "Changes",
] as const

interface PrivacyViewProps {
    language: LanguageKey
}

export const PrivacyView = (props: PrivacyViewProps) => {
    const t = getTranslation(props.language)

    return (
        <article className="mx-auto flex max-w-xl flex-col items-start gap-6 p-4">
            <header className="flex flex-col gap-2">
                <h1 className="tp-pixel-2xl uppercase">{t("Privacy.Title")}</h1>
                <p className="tp-body-sm text-fg-muted">{t("Privacy.Updated")}</p>
                <p className="tp-body-md">{t("Privacy.Intro")}</p>
            </header>
            {SECTIONS.map(section => (
                <section key={section} className="flex flex-col gap-2">
                    <h2 className="tp-pixel-lg uppercase">
                        {t(`Privacy.Sections.${section}.Title`)}
                    </h2>
                    <p className="tp-body-md">
                        {t(`Privacy.Sections.${section}.Body`, { email: CONTACT_EMAIL })}
                    </p>
                </section>
            ))}
            <a href={`mailto:${CONTACT_EMAIL}`} className="tp-pixel-md text-fg underline">
                {t("Legal.WriteTo", { email: CONTACT_EMAIL })}
            </a>
            <RouteLink
                route={routes.root}
                parameters={{ lang: props.language }}
                query={{}}
                className="tp-pixel-md text-fg underline"
            >
                {t("Legal.BackHome")}
            </RouteLink>
        </article>
    )
}
