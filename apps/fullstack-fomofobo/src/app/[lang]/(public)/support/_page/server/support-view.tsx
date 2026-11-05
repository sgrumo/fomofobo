import "server-only"
import type { LanguageKey } from "i18n/i18n"

import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import { getTranslation } from "@/lib/i18n/server/translation"
import { CONTACT_EMAIL } from "@/lib/platform/platform"

const QUESTIONS = ["Location", "Saved", "Missing", "Publish"] as const

interface SupportViewProps {
    language: LanguageKey
}

export const SupportView = (props: SupportViewProps) => {
    const t = getTranslation(props.language)

    return (
        <article className="mx-auto flex max-w-xl flex-col items-start gap-6 p-4">
            <header className="flex flex-col gap-2">
                <h1 className="tp-pixel-2xl uppercase">{t("Support.Title")}</h1>
                <p className="tp-body-md">{t("Support.Intro")}</p>
            </header>
            <a href={`mailto:${CONTACT_EMAIL}`} className="tp-pixel-md text-fg underline">
                {t("Legal.WriteTo", { email: CONTACT_EMAIL })}
            </a>
            {QUESTIONS.map(question => (
                <section key={question} className="flex flex-col gap-2">
                    <h2 className="tp-pixel-lg uppercase">
                        {t(`Support.Questions.${question}.Title`)}
                    </h2>
                    <p className="tp-body-md">
                        {t(`Support.Questions.${question}.Body`)}
                    </p>
                </section>
            ))}
            <RouteLink
                route={routes.privacy}
                parameters={{ lang: props.language }}
                query={{}}
                className="tp-pixel-md text-fg underline"
            >
                {t("Legal.Privacy")}
            </RouteLink>
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
