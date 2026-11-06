import type { OccurrenceRef } from "models"
import { useTranslation } from "react-i18next"

import { IconButton } from "@/components/ui/icon-button/icon-button"
import { useSavedEvents } from "@/lib/hooks/use-saved-events"
import { syncSaveChange } from "@/lib/saves/device-save-sync"
import { playSound } from "@/lib/sounds/play-sound"

interface SaveToggleProps {
    occurrence: OccurrenceRef
    size?: "sm" | "md"
}

export const SaveToggle = (props: SaveToggleProps) => {
    const { t } = useTranslation("shared")
    const savedEvents = useSavedEvents()
    const ref = { eventId: props.occurrence.eventId, date: props.occurrence.date }
    const saved = savedEvents.isSaved(ref)

    return (
        <IconButton
            icon={saved ? "saved" : "save"}
            label={t("Saved.Toggle")}
            selected={saved}
            size={props.size}
            onPress={() => {
                playSound(saved ? "save-off" : "save-on")
                if (saved) {
                    savedEvents.unsave(ref)
                } else {
                    savedEvents.save(ref)
                }
                void syncSaveChange({ ...ref, action: saved ? "unsave" : "save" })
            }}
        />
    )
}
