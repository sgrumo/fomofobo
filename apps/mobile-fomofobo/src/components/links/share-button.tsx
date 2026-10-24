import { useTranslation } from "react-i18next"
import { Platform, Share } from "react-native"

import { IconButton } from "@/components/ui/icon-button/icon-button"
import { toastError } from "@/components/ui/toast/toast"
import { shareContentOf } from "@/lib/share/share-content"

interface ShareButtonProps {
    url: string
    text: string
}

export const ShareButton = (props: ShareButtonProps) => {
    const { t } = useTranslation("shared")

    return (
        <IconButton
            icon="share"
            label={t("Detail.Share")}
            onPress={() => {
                Share.share(
                    shareContentOf(Platform.OS, { url: props.url, text: props.text }),
                ).catch(() => {
                    toastError(t("Detail.ShareFailed"))
                })
            }}
        />
    )
}
