"use client"

import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { IconButton } from "ui-components/icon-button"
import {
    PixelIconFacebook,
    PixelIconLink,
    PixelIconTelegram,
    PixelIconWhatsApp,
    PixelIconX,
} from "ui-components/pixel-icons"

import { useCopyLink } from "@/lib/hooks/use-copy-link"
import { shareUrlOf } from "@/lib/share/share-urls"
import type { ShareTarget } from "@/lib/share/share-urls"

const shareTargets: ReadonlyArray<{ target: ShareTarget; icon: ReactNode }> = [
    { target: "whatsapp", icon: <PixelIconWhatsApp /> },
    { target: "telegram", icon: <PixelIconTelegram /> },
    { target: "facebook", icon: <PixelIconFacebook /> },
    { target: "x", icon: <PixelIconX /> },
]

const shareLinkClassName =
    "pixel-circle-40 drop-shadow-hard-md text-fg focus-visible:outline-focus relative inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:[--pixel-fill:var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-4"

interface ShareRowProps {
    url: string
    text: string
}

export const ShareRow = (props: ShareRowProps) => {
    const { t } = useTranslation("shared")
    const copyLink = useCopyLink()

    return (
        <section aria-label={t("Detail.ShareOn.Label")} className="flex flex-col gap-2">
            <h2 className="tp-pixel-sm text-fg-muted uppercase">
                {t("Detail.ShareOn.Label")}
            </h2>
            <div className="flex flex-wrap gap-3">
                {shareTargets.map(({ target, icon }) => (
                    <a
                        key={target}
                        href={shareUrlOf(target, { url: props.url, text: props.text })}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={t(`Detail.ShareOn.${target}`)}
                        className={shareLinkClassName}
                    >
                        {icon}
                    </a>
                ))}
                <IconButton
                    aria-label={t("Detail.ShareOn.Copy")}
                    icon={<PixelIconLink />}
                    onClick={() => {
                        void copyLink(props.url)
                    }}
                />
            </div>
        </section>
    )
}
