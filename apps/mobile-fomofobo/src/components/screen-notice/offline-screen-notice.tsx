import { router } from "expo-router"
import { useTranslation } from "react-i18next"

import { ScreenNotice } from "@/components/screen-notice/screen-notice"
import { backToMap } from "@/lib/navigation/back-to-map"

interface OfflineScreenNoticeProps {
    message: string
}

export const OfflineScreenNotice = (props: OfflineScreenNoticeProps) => {
    const { t } = useTranslation("shared")

    return (
        <ScreenNotice
            tone="info"
            message={props.message}
            actions={[
                { label: t("Detail.BackToMap"), onPress: backToMap },
                {
                    label: t("Saved.Open"),
                    onPress: () => {
                        router.push("/saved")
                    },
                },
            ]}
        />
    )
}
