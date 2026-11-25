"use client"

import type { UsefulLink, UsefulLinkType } from "domain/useful-links"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import {
    PixelIconFacebook,
    PixelIconInstagram,
    PixelIconLink,
} from "ui-components/pixel-icons"

const LINK_ICONS = {
    website: <PixelIconLink />,
    instagram: <PixelIconInstagram />,
    facebook: <PixelIconFacebook />,
} satisfies Record<UsefulLinkType, ReactNode>

interface UsefulLinksProps {
    links: UsefulLink[]
}

export const UsefulLinks = (props: UsefulLinksProps) => {
    const { t } = useTranslation("shared")

    return props.links.length === 0 ? undefined : (
        <section aria-label={t("Detail.UsefulLinks")} className="flex flex-col gap-2">
            <h2 className="tp-pixel-sm text-fg-muted uppercase">
                {t("Detail.UsefulLinks")}
            </h2>
            <div className="flex flex-wrap gap-3">
                {props.links.map(link => (
                    <a
                        key={link.type}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-surface text-fg border-line shadow-hard-md press-bounce active:shadow-hard-sm tp-pixel-sm flex grow items-center justify-center gap-2 rounded-md border-2 px-3 py-3 uppercase [&>svg]:size-4"
                    >
                        {LINK_ICONS[link.type]}
                        {t(`Detail.Links.${link.type}`)}
                    </a>
                ))}
            </div>
        </section>
    )
}
