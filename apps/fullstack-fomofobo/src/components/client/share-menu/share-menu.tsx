"use client"

import { shareUrlOf } from "domain/share-urls"
import type { ShareTarget } from "domain/share-urls"
import { useState } from "react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { IconButton } from "ui-components/icon-button"
import {
    PixelIconFacebook,
    PixelIconLink,
    PixelIconShare,
    PixelIconTelegram,
    PixelIconWhatsApp,
} from "ui-components/pixel-icons"
import { PopoverContent, PopoverRoot, PopoverTrigger } from "ui-components/popover"

import { useCopyLink } from "@/lib/hooks/use-copy-link"

const shareTargets: ReadonlyArray<{ target: ShareTarget; icon: ReactNode }> = [
    { target: "whatsapp", icon: <PixelIconWhatsApp /> },
    { target: "telegram", icon: <PixelIconTelegram /> },
    { target: "facebook", icon: <PixelIconFacebook /> },
]

const shareLinkClassName =
    "pixel-circle-48 drop-shadow-hard-md press-bounce active:drop-shadow-hard-sm text-fg focus-visible:outline-focus relative inline-flex size-12 shrink-0 items-center justify-center rounded-full hover:[--pixel-fill:var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-5"

const shareOptionClassName = "flex w-16 flex-col items-center gap-1.5"

interface ShareMenuProps {
    url: string
    text: string
}

export const ShareMenu = (props: ShareMenuProps) => {
    const { t } = useTranslation("shared")
    const copyLink = useCopyLink()
    const [open, setOpen] = useState(false)

    return (
        <PopoverRoot open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <IconButton
                        aria-label={t("Detail.ShareOn.Open")}
                        icon={<PixelIconShare />}
                        tone={open ? "inverse" : "surface"}
                    />
                }
            />
            <PopoverContent
                showArrow={true}
                className="flex-row gap-1 px-2 py-3"
                positionerProps={{ side: "bottom", align: "end" }}
            >
                {shareTargets.map(({ target, icon }) => (
                    <span key={target} className={shareOptionClassName}>
                        <a
                            href={shareUrlOf(target, {
                                url: props.url,
                                text: props.text,
                            })}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={t(`Detail.ShareOn.${target}`)}
                            className={shareLinkClassName}
                            onClick={() => {
                                setOpen(false)
                            }}
                        >
                            {icon}
                        </a>
                        <span aria-hidden={true} className="tp-pixel-sm">
                            {t(`Detail.ShareOn.Names.${target}`)}
                        </span>
                    </span>
                ))}
                <span className={shareOptionClassName}>
                    <IconButton
                        aria-label={t("Detail.ShareOn.Copy")}
                        icon={<PixelIconLink />}
                        size="lg"
                        onClick={() => {
                            setOpen(false)
                            void copyLink(props.url)
                        }}
                    />
                    <span aria-hidden={true} className="tp-pixel-sm">
                        {t("Detail.ShareOn.Names.link")}
                    </span>
                </span>
            </PopoverContent>
        </PopoverRoot>
    )
}
